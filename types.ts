
export type AttendanceStatus = 'present' | 'leave' | 'absent' | 'unmarked';

export interface Student {
  id: string;
  name: string;
  addedAt: number;
}

export interface AttendanceRecord {
  id: string; // date_studentId
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
}

export interface DailyStats {
  present: number;
  leave: number;
  absent: number;
}
