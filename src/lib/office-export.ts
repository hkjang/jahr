import PptxGenJS from "pptxgenjs";
import ExcelJS from "exceljs";

interface OrganizationNode {
    id: string;
    code: string;
    name: string;
    level: string;
    children?: OrganizationNode[];
    employeeCount?: number;
}

/**
 * 조직도를 PowerPoint 파일로 생성
 */
export async function generateOrgChartPPT(
    organizations: OrganizationNode[]
): Promise<Buffer> {
    const pptx = new PptxGenJS();

    // 첫 번째 슬라이드: 타이틀
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "1F2937" }; // Dark gray

    titleSlide.addText("조직도", {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 44,
        bold: true,
        color: "FFFFFF",
        align: "center",
    });

    titleSlide.addText(new Date().toLocaleDateString("ko-KR"), {
        x: 1,
        y: 3.5,
        w: 8,
        h: 0.5,
        fontSize: 18,
        color: "9CA3AF",
        align: "center",
    });

    // 두 번째 슬라이드: 조직도 트리
    const orgSlide = pptx.addSlide();
    orgSlide.background = { color: "FFFFFF" };

    let yPosition = 0.5;

    function addOrgNode(
        slide: any,
        org: OrganizationNode,
        xPos: number,
        yPos: number,
        level: number
    ) {
        const colors = ["3B82F6", "8B5CF6", "EC4899", "F59E0B"];
        const color = colors[level % colors.length];

        slide.addShape(pptx.ShapeType.rect, {
            x: xPos,
            y: yPos,
            w: 2,
            h: 0.6,
            fill: { color },
            line: { color: "FFFFFF", width: 2 },
        });

        slide.addText(org.name, {
            x: xPos,
            y: yPos + 0.05,
            w: 2,
            h: 0.3,
            fontSize: 12,
            bold: true,
            color: "FFFFFF",
            align: "center",
        });

        slide.addText(`${org.employeeCount || 0}명`, {
            x: xPos,
            y: yPos + 0.35,
            w: 2,
            h: 0.2,
            fontSize: 10,
            color: "FFFFFF",
            align: "center",
        });

        return yPos + 0.8;
    }

    // 재귀적으로 조직 추가
    organizations.forEach((org, index) => {
        yPosition = addOrgNode(orgSlide, org, 1 + index * 2.5, yPosition, 0);
    });

    return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}

/**
 * HR 통계를 Excel 파일로 생성
 */
export async function generateHRStatsExcel(data: {
    organizations: Array<{
        name: string;
        headcount: number;
        avgAge: number;
        avgTenure: number;
    }>;
    summary: {
        totalEmployees: number;
        maleCount: number;
        femaleCount: number;
        avgAge: number;
        avgTenure: number;
    };
}): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // 메타데이터
    workbook.creator = "JaHR System";
    workbook.created = new Date();

    // 요약 시트
    const summarySheet = workbook.addWorksheet("요약", {
        views: [{ state: "frozen", ySplit: 1 }],
    });

    summarySheet.columns = [
        { header: "지표", key: "metric", width: 30 },
        { header: "값", key: "value", width: 20 },
    ];

    summarySheet.addRows([
        { metric: "총 인원", value: data.summary.totalEmployees },
        { metric: "남성", value: data.summary.maleCount },
        { metric: "여성", value: data.summary.femaleCount },
        { metric: "평균 연령", value: `${data.summary.avgAge.toFixed(1)}세` },
        { metric: "평균 근속", value: `${data.summary.avgTenure.toFixed(1)}년` },
    ]);

    // 헤더 스타일
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
    };
    summarySheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // 조직별 시트
    const orgSheet = workbook.addWorksheet("조직별 현황", {
        views: [{ state: "frozen", ySplit: 1 }],
    });

    orgSheet.columns = [
        { header: "조직명", key: "name", width: 30 },
        { header: "인원수", key: "headcount", width: 15 },
        { header: "평균 연령", key: "avgAge", width: 15 },
        { header: "평균 근속", key: "avgTenure", width: 15 },
    ];

    data.organizations.forEach((org) => {
        orgSheet.addRow({
            name: org.name,
            headcount: org.headcount,
            avgAge: `${org.avgAge.toFixed(1)}세`,
            avgTenure: `${org.avgTenure.toFixed(1)}년`,
        });
    });

    // 헤더 스타일
    orgSheet.getRow(1).font = { bold: true };
    orgSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
    };
    orgSheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    return (await workbook.xlsx.writeBuffer()) as Buffer;
}

/**
 * 인건비 분석을 Excel로 생성
 */
export async function generateLaborCostExcel(data: {
    actuals: Array<{
        yearMonth: string;
        totalActual: number;
        variance: number;
        variancePercent: number;
    }>;
}): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("인건비 실적");

    sheet.columns = [
        { header: "기간", key: "yearMonth", width: 15 },
        { header: "실적", key: "totalActual", width: 20 },
        { header: "차이액", key: "variance", width: 20 },
        { header: "차이율 (%)", key: "variancePercent", width: 15 },
    ];

    data.actuals.forEach((item) => {
        sheet.addRow({
            yearMonth: item.yearMonth,
            totalActual: item.totalActual,
            variance: item.variance,
            variancePercent: item.variancePercent,
        });
    });

    // 헤더 스타일
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
    };
    sheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // 숫자 포맷
    sheet.getColumn("totalActual").numFmt = "#,##0";
    sheet.getColumn("variance").numFmt = "#,##0";
    sheet.getColumn("variancePercent").numFmt = "0.00";

    return (await workbook.xlsx.writeBuffer()) as Buffer;
}
