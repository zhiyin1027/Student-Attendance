
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AttendanceRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAttendanceSummary = async (
  students: Student[], 
  records: AttendanceRecord[], 
  startDate?: string, 
  endDate?: string,
  targetStudentId?: string | null
) => {
  if (students.length === 0) return "没有学生数据可供分析。";
  
  const periodText = startDate && endDate ? `从 ${startDate} 到 ${endDate}` : "所有历史记录";
  const targetStudent = targetStudentId ? students.find(s => s.id === targetStudentId) : null;
  
  const contextDescription = targetStudent 
    ? `针对学生 [${targetStudent.name}] 的个人出勤详细报告`
    : `针对全班学生的整体出勤总结报告`;

  const analysisFocus = targetStudent
    ? `
    分析重点：
    1. 该学生的整体出勤率和稳定性。
    2. 具体的缺勤或请假模式（例如：是否经常在特定月份请假）。
    3. 出勤表现评估（优秀、良好、需改进）。
    4. 针对该学生的个性化教师评语和关怀建议。`
    : `
    分析重点：
    1. 班级整体出勤率分析。
    2. 频繁请假或缺勤的学生名单及其具体情况。
    3. 出勤模式分析（例如：月度趋势变化，或特定时段出勤异常）。
    4. 针对教师的班级管理改进建议。`;

  const prompt = `
    请作为一名资深教育顾问，根据以下数据提供一份专业且详细的${periodText}${contextDescription}。
    
    ${analysisFocus}

    ${targetStudent ? `目标学生信息: ${JSON.stringify(targetStudent)}` : `全班学生名单: ${JSON.stringify(students)}`}
    相关出勤记录: ${JSON.stringify(targetStudent ? records.filter(r => r.studentId === targetStudentId) : records)}

    请使用中文回答，保持语气亲切、专业且富有洞察力。请使用 Markdown 格式化输出。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "无法生成分析报告。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 分析服务当前不可用，请稍后再试。";
  }
};
