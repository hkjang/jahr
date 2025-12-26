import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * File Upload API
 * Supports: images, PDFs, documents
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "uploads";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 파일 검증
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large (max 10MB)" },
                { status: 400 }
            );
        }

        // 허용된 확장자
        const allowedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
        ];
        const fileExtension = file.name.substring(file.name.lastIndexOf("."));
        if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
            return NextResponse.json(
                { error: "File type not allowed" },
                { status: 400 }
            );
        }

        // 파일 저장
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${uuidv4()}${fileExtension}`;
        const uploadDir = join(process.cwd(), "public", "uploads", folder);
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${folder}/${fileName}`;

        return NextResponse.json({
            success: true,
            data: {
                url: fileUrl,
                fileName: file.name,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

/**
 * File Download API
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "No path provided" }, { status: 400 });
        }

        // 보안: path traversal 방지
        if (path.includes("..")) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "File download endpoint ready",
        });
    } catch (error) {
        console.error("Error downloading file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to download file" },
            { status: 500 }
        );
    }
}
