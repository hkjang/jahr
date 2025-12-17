// 알림 서비스 - 이메일 및 메신저 연동
// Phase 2.5: 알림 자동화

import { prisma } from "./prisma";

// ========================================
// 타입 정의
// ========================================

export type NotificationChannel = "in-app" | "email" | "slack" | "teams";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  link?: string;
  channels?: NotificationChannel[];
  priority?: "low" | "normal" | "high" | "urgent";
  data?: Record<string, unknown>;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
}

export interface TeamsConfig {
  webhookUrl: string;
}

// ========================================
// 알림 템플릿
// ========================================

export const NOTIFICATION_TEMPLATES = {
  // 입사 관련
  WELCOME: {
    title: "환영합니다!",
    message: "${employeeName}님, ${organizationName}에 오신 것을 환영합니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },
  
  // 휴가 관련
  LEAVE_APPROVED: {
    title: "휴가가 승인되었습니다",
    message: "${startDate} ~ ${endDate} 휴가가 승인되었습니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },
  LEAVE_REJECTED: {
    title: "휴가가 반려되었습니다",
    message: "${startDate} ~ ${endDate} 휴가가 반려되었습니다. 사유: ${reason}",
    channels: ["in-app", "email"] as NotificationChannel[],
  },
  LEAVE_REQUEST: {
    title: "휴가 신청이 접수되었습니다",
    message: "${employeeName}님이 ${startDate} ~ ${endDate} 휴가를 신청했습니다.",
    channels: ["in-app"] as NotificationChannel[],
  },

  // 결재 관련
  APPROVAL_REQUEST: {
    title: "결재 요청이 있습니다",
    message: "${requesterName}님이 ${docType}을(를) 요청했습니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },
  APPROVAL_COMPLETED: {
    title: "결재가 완료되었습니다",
    message: "${docType} 결재가 ${status} 처리되었습니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },

  // 근태 관련
  ATTENDANCE_ALERT: {
    title: "근태 이상 알림",
    message: "${alertType}: ${message}",
    channels: ["in-app"] as NotificationChannel[],
  },

  // 평가 관련
  EVALUATION_START: {
    title: "평가 기간이 시작되었습니다",
    message: "${periodName} 평가가 시작되었습니다. 마감일: ${deadline}",
    channels: ["in-app", "email"] as NotificationChannel[],
  },
  EVALUATION_REMINDER: {
    title: "평가 마감 알림",
    message: "평가 마감까지 ${daysLeft}일 남았습니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },

  // 급여 관련
  SALARY_STATEMENT: {
    title: "급여 명세서가 발급되었습니다",
    message: "${yearMonth} 급여 명세서를 확인해주세요.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },

  // 발령 관련
  APPOINTMENT_NOTICE: {
    title: "인사 발령 안내",
    message: "${appointmentType} 발령이 ${effectiveDate}부터 적용됩니다.",
    channels: ["in-app", "email"] as NotificationChannel[],
  },

  // 시스템
  SYSTEM_NOTICE: {
    title: "시스템 공지",
    message: "${message}",
    channels: ["in-app"] as NotificationChannel[],
  },
} as const;

export type NotificationTemplateKey = keyof typeof NOTIFICATION_TEMPLATES;

// ========================================
// 알림 서비스 클래스
// ========================================

export class NotificationService {
  // 알림 발송
  static async send(payload: NotificationPayload): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const channels = payload.channels || ["in-app"];
    const results: Record<string, boolean> = {};

    for (const channel of channels) {
      try {
        switch (channel) {
          case "in-app":
            await this.sendInApp(payload);
            results["in-app"] = true;
            break;
          case "email":
            await this.sendEmail(payload);
            results["email"] = true;
            break;
          case "slack":
            await this.sendSlack(payload);
            results["slack"] = true;
            break;
          case "teams":
            await this.sendTeams(payload);
            results["teams"] = true;
            break;
        }
      } catch (error) {
        console.error(`Notification ${channel} error:`, error);
        results[channel] = false;
      }
    }

    return {
      success: Object.values(results).some((v) => v),
      results,
    };
  }

  // 템플릿 기반 알림 발송
  static async sendFromTemplate(
    templateKey: NotificationTemplateKey,
    userId: string,
    variables: Record<string, string>,
    overrideChannels?: NotificationChannel[]
  ) {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    
    // 변수 치환
    let title = template.title;
    let message = template.message;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `\${${key}}`;
      title = title.replace(placeholder, value);
      message = message.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
    }

    return this.send({
      userId,
      title,
      message,
      channels: overrideChannels || template.channels,
    });
  }

  // 다수에게 알림 발송
  static async sendToMany(
    userIds: string[],
    payload: Omit<NotificationPayload, "userId">
  ) {
    const results = await Promise.all(
      userIds.map((userId) => this.send({ ...payload, userId }))
    );
    
    return {
      total: userIds.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  // 역할별 알림 발송
  static async sendToRole(
    roleCode: string,
    payload: Omit<NotificationPayload, "userId">
  ) {
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        roles: {
          some: {
            role: { code: roleCode },
          },
        },
      },
      select: { id: true },
    });

    return this.sendToMany(
      users.map((u) => u.id),
      payload
    );
  }

  // 부서별 알림 발송
  static async sendToOrganization(
    organizationId: string,
    payload: Omit<NotificationPayload, "userId">
  ) {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId,
        user: { status: "ACTIVE" },
      },
      select: { userId: true },
    });

    return this.sendToMany(
      employees.map((e) => e.userId),
      payload
    );
  }

  // ========================================
  // 채널별 발송 구현
  // ========================================

  // 인앱 알림
  private static async sendInApp(payload: NotificationPayload) {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        link: payload.link,
      },
    });
  }

  // 이메일 발송 (nodemailer 필요)
  private static async sendEmail(payload: NotificationPayload) {
    // 사용자 이메일 조회
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      throw new Error("User email not found");
    }

    // TODO: nodemailer 연동
    // 현재는 로그만 출력
    console.log(`[Email] To: ${user.email}`);
    console.log(`[Email] Subject: ${payload.title}`);
    console.log(`[Email] Body: ${payload.message}`);

    // 실제 구현 시:
    // const transporter = nodemailer.createTransporter(emailConfig);
    // await transporter.sendMail({
    //   from: emailConfig.from,
    //   to: user.email,
    //   subject: payload.title,
    //   html: this.generateEmailHtml(payload),
    // });
  }

  // Slack 발송
  private static async sendSlack(payload: NotificationPayload) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) {
      throw new Error("Slack webhook URL not configured");
    }

    const slackPayload = {
      text: payload.title,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: payload.title },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: payload.message },
        },
        ...(payload.link ? [{
          type: "actions",
          elements: [{
            type: "button",
            text: { type: "plain_text", text: "자세히 보기" },
            url: payload.link,
          }],
        }] : []),
      ],
    };

    await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });
  }

  // Microsoft Teams 발송
  private static async sendTeams(payload: NotificationPayload) {
    const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
    if (!teamsWebhook) {
      throw new Error("Teams webhook URL not configured");
    }

    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: "0076D7",
      summary: payload.title,
      sections: [{
        activityTitle: payload.title,
        text: payload.message,
      }],
      potentialAction: payload.link ? [{
        "@type": "OpenUri",
        name: "자세히 보기",
        targets: [{ os: "default", uri: payload.link }],
      }] : [],
    };

    await fetch(teamsWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamsPayload),
    });
  }

  // 이메일 HTML 생성
  static generateEmailHtml(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px; }
          .content { font-size: 16px; color: #4a4a4a; line-height: 1.6; }
          .button { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">${payload.title}</div>
          <div class="content">${payload.message}</div>
          ${payload.link ? `<a href="${payload.link}" class="button">자세히 보기</a>` : ""}
          <div class="footer">
            이 메일은 JaHR 시스템에서 자동 발송되었습니다.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// 편의 함수들
export const notify = NotificationService.send.bind(NotificationService);
export const notifyFromTemplate = NotificationService.sendFromTemplate.bind(NotificationService);
export const notifyMany = NotificationService.sendToMany.bind(NotificationService);
export const notifyRole = NotificationService.sendToRole.bind(NotificationService);
export const notifyOrganization = NotificationService.sendToOrganization.bind(NotificationService);
