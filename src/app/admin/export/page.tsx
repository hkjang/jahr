"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Download, FileSpreadsheet, FileText, Presentation } from "lucide-react";

export default function AdminExportPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: string, format: string) => {
        setIsExporting(true);
        try {
            const url = `/api/export?type=${type}&format=${format}`;
            window.open(url, "_blank");
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div>
                <h1 className="text-2xl font-bold text-white">데이터 내보내기</h1>
                <p className="text-gray-400 mt-1">
                    HR 데이터를 다양한 형식으로 내보냅니다.
                </p>
            </div>

            {/* CSV 내보내기 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        CSV/Excel 내보내기
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={() => handleExport("employees", "csv")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gray-700 hover:bg-gray-600"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-green-400" />
                            <span className="text-white">직원 목록</span>
                            <span className="text-xs text-gray-400">CSV</span>
                        </Button>

                        <Button
                            onClick={() => handleExport("attendance", "csv")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gray-700 hover:bg-gray-600"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-green-400" />
                            <span className="text-white">근태 기록</span>
                            <span className="text-xs text-gray-400">CSV</span>
                        </Button>

                        <Button
                            onClick={() => handleExport("salary", "csv")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gray-700 hover:bg-gray-600"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-green-400" />
                            <span className="text-white">급여 대장</span>
                            <span className="text-xs text-gray-400">CSV</span>
                        </Button>

                        <Button
                            onClick={() => handleExport("leaves", "csv")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gray-700 hover:bg-gray-600"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-green-400" />
                            <span className="text-white">휴가 기록</span>
                            <span className="text-xs text-gray-400">CSV</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Office 내보내기 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Presentation className="w-5 h-5 text-orange-400" />
                        Office 문서 내보내기
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={() => handleExport("orgchart", "ppt")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gradient-to-br from-orange-900/40 to-red-900/40 hover:from-orange-900/60 hover:to-red-900/60 border border-orange-700/50"
                        >
                            <Presentation className="w-8 h-8 text-orange-400" />
                            <span className="text-white">조직도</span>
                            <span className="text-xs text-gray-400">PowerPoint</span>
                        </Button>

                        <Button
                            onClick={() => handleExport("stats", "excel")}
                            disabled={isExporting}
                            className="h-20 flex-col gap-2 bg-gradient-to-br from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border border-green-700/50"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-green-400" />
                            <span className="text-white">HR 통계</span>
                            <span className="text-xs text-gray-400">Excel</span>
                        </Button>
                    </div>

                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-white mb-1">Office 문서 기능</p>
                                <p>• PowerPoint: 조직도 시각화 및 슬라이드 생성</p>
                                <p>• Excel: 통계 데이터 및 차트 포함</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 내보내기 히스토리 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-400" />
                        최근 내보내기 기록
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-gray-400">
                        내보내기 기록이 여기에 표시됩니다.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
