
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AttendanceRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAttendanceSummary = async (
  students: Student[], 
  records: AttendanceRecord[], 
  startDate?: string, 
  endDate?: string
) => {
  if (students.length === 0) return "没有学生数据可供分析。";
  
  const periodText = startDate && endDate ? `从 ${startDate} 到 ${endDate}` : "所有历史记录";
  
  const prompt = `
    请根据以下学生出勤数据，为教师提供一份专业且详细的${periodText}出勤总结报告。
    
    分析重点：
    1. 整体出勤率分析。
    2. 频繁请假或缺勤的学生名单及其具体情况。
    3. 出勤模式分析（例如：周一出勤率低，或某个特定时段出勤异常）。
    4. 针对教师的改进建议或对学生的关怀建议。

    学生名单: ${JSON.stringify(students)}
    出勤记录: ${JSON.stringify(records)}

    请使用中文回答，保持语气亲切且专业。请使用 Markdown 格式化输出。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "无法生成总结报告。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 服务当前不可用，请稍后再试。";
  }
};
