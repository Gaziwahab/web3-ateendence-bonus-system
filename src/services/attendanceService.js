import { supabase, isSupabaseConfigured } from './supabase';
import {
  initialProfiles,
  initialSubjects,
  initialAttendance,
  initialRewards,
} from './mockData';

const LOCAL_STORAGE_KEYS = {
  PROFILES: 'attend_profiles_v1',
  SUBJECTS: 'attend_subjects_v1',
  ATTENDANCE: 'attend_attendance_v1',
  REWARDS: 'attend_rewards_v1',
};

// Local storage storage helpers
const loadLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving to localStorage [${key}]`, err);
  }
};

export const attendanceService = {
  // ===================== PROFILES =====================
  async getProfiles() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getProfiles query failed, falling back to local dataset:', err);
      }
    }
    return loadLocal(LOCAL_STORAGE_KEYS.PROFILES, initialProfiles);
  },

  async getStudents() {
    const profiles = await this.getProfiles();
    return profiles.filter((p) => p.role === 'student');
  },

  async getFaculty() {
    const profiles = await this.getProfiles();
    return profiles.filter((p) => p.role === 'faculty');
  },

  async createProfile(profileData) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createProfile failed, saving locally:', err);
      }
    }

    const profiles = loadLocal(LOCAL_STORAGE_KEYS.PROFILES, initialProfiles);
    const newProfile = {
      id: profileData.id || `profile-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...profileData,
    };
    profiles.push(newProfile);
    saveLocal(LOCAL_STORAGE_KEYS.PROFILES, profiles);
    return newProfile;
  },

  async updateProfileWallet(profileId, walletAddress) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ wallet_address: walletAddress })
          .eq('id', profileId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateProfileWallet failed, updating locally:', err);
      }
    }

    const profiles = loadLocal(LOCAL_STORAGE_KEYS.PROFILES, initialProfiles);
    const index = profiles.findIndex((p) => p.id === profileId);
    if (index !== -1) {
      profiles[index].wallet_address = walletAddress;
      saveLocal(LOCAL_STORAGE_KEYS.PROFILES, profiles);
      return profiles[index];
    }
    return null;
  },

  // ===================== SUBJECTS =====================
  async getSubjects() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('subjects').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getSubjects failed, falling back to local dataset:', err);
      }
    }
    return loadLocal(LOCAL_STORAGE_KEYS.SUBJECTS, initialSubjects);
  },

  async createSubject(subjectData) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .insert([subjectData])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createSubject failed, saving locally:', err);
      }
    }

    const subjects = loadLocal(LOCAL_STORAGE_KEYS.SUBJECTS, initialSubjects);
    const newSubj = {
      id: `subj-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...subjectData,
    };
    subjects.push(newSubj);
    saveLocal(LOCAL_STORAGE_KEYS.SUBJECTS, subjects);
    return newSubj;
  },

  // ===================== ATTENDANCE =====================
  async getAttendance(filters = {}) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('attendance').select('*');
        if (filters.student_id) query = query.eq('student_id', filters.student_id);
        if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
        if (filters.attendance_date) query = query.eq('attendance_date', filters.attendance_date);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAttendance failed, falling back to local dataset:', err);
      }
    }

    let records = loadLocal(LOCAL_STORAGE_KEYS.ATTENDANCE, initialAttendance);
    if (filters.student_id) {
      records = records.filter((r) => r.student_id === filters.student_id);
    }
    if (filters.subject_id) {
      records = records.filter((r) => r.subject_id === filters.subject_id);
    }
    if (filters.attendance_date) {
      records = records.filter((r) => r.attendance_date === filters.attendance_date);
    }
    return records;
  },

  /**
   * Submits daily attendance for a batch of students.
   * Enforces duplicate submission prevention for the same student, subject and date.
   */
  async submitAttendanceBatch({ subject_id, attendance_date, marked_by, studentStatuses }) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const rows = studentStatuses.map((item) => ({
          student_id: item.student_id,
          subject_id,
          attendance_date,
          status: item.status,
          marked_by,
        }));

        const { data, error } = await supabase
          .from('attendance')
          .upsert(rows, { onConflict: 'student_id,subject_id,attendance_date' })
          .select();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase submitAttendanceBatch failed, updating locally:', err);
      }
    }

    // Local storage fallback with duplicate handling
    const existing = loadLocal(LOCAL_STORAGE_KEYS.ATTENDANCE, initialAttendance);
    
    // Remove any previous entry matching (student_id, subject_id, attendance_date) to simulate upsert
    const updated = existing.filter(
      (r) =>
        !(
          r.subject_id === subject_id &&
          r.attendance_date === attendance_date &&
          studentStatuses.some((s) => s.student_id === r.student_id)
        )
    );

    const newRecords = studentStatuses.map((s, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      student_id: s.student_id,
      subject_id,
      attendance_date,
      status: s.status,
      marked_by,
      created_at: new Date().toISOString(),
    }));

    const finalRecords = [...updated, ...newRecords];
    saveLocal(LOCAL_STORAGE_KEYS.ATTENDANCE, finalRecords);
    return newRecords;
  },

  // ===================== REWARDS =====================
  async getRewards(studentId = null) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('rewards').select('*');
        if (studentId) query = query.eq('student_id', studentId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getRewards failed, falling back to local dataset:', err);
      }
    }

    const records = loadLocal(LOCAL_STORAGE_KEYS.REWARDS, initialRewards);
    if (studentId) {
      return records.filter((r) => r.student_id === studentId);
    }
    return records;
  },

  async recordRewardDistribution({
    student_id,
    semester_id,
    attendance_percentage,
    reward_points,
    transaction_hash,
  }) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('rewards')
          .insert([
            {
              student_id,
              semester_id,
              attendance_percentage,
              reward_points,
              transaction_hash,
              status: 'confirmed',
            },
          ])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase recordRewardDistribution failed, saving locally:', err);
      }
    }

    const rewards = loadLocal(LOCAL_STORAGE_KEYS.REWARDS, initialRewards);
    
    // Check if duplicate for same student and semester
    const exists = rewards.some(
      (r) => r.student_id === student_id && r.semester_id === Number(semester_id)
    );
    if (exists) {
      throw new Error(`Reward already distributed to this student for Semester ${semester_id}. Duplicate reward prevented.`);
    }

    const newReward = {
      id: `rew-${Date.now()}`,
      student_id,
      semester_id: Number(semester_id),
      attendance_percentage: Number(attendance_percentage),
      reward_points: Number(reward_points),
      transaction_hash,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    rewards.push(newReward);
    saveLocal(LOCAL_STORAGE_KEYS.REWARDS, rewards);
    return newReward;
  },

  async resetLocalData() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PROFILES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REWARDS);
    window.location.reload();
  },
};
