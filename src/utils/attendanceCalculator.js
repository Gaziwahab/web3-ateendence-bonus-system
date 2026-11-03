import { REWARD_SLABS } from './constants';

/**
 * Calculates attendance percentage from present and total counts
 * Formula: (Total Present Lectures / Total Lectures) * 100
 * @param {number} present 
 * @param {number} total 
 * @returns {number} Percentage rounded to 2 decimal places
 */
export const calculatePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  const pct = (present / total) * 100;
  return Number(pct.toFixed(2));
};

/**
 * Determines reward points and slab details based on attendance percentage
 * @param {number} percentage 
 * @returns {object} { points, label, badgeColor, description, isEligible }
 */
export const getRewardEligibility = (percentage) => {
  const rounded = Number(percentage);
  
  if (rounded >= 90) {
    return {
      points: 50,
      label: '90% to 100%',
      tier: 'Gold Tier',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Gold Tier: 50 Incentive Points',
      isEligible: true,
    };
  }
  
  if (rounded >= 75) {
    return {
      points: 20,
      label: '75% to 89.99%',
      tier: 'Silver Tier',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Silver Tier: 20 Incentive Points',
      isEligible: true,
    };
  }

  return {
    points: 0,
    label: 'Below 75%',
    tier: 'Ineligible',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Attendance below 75% minimum requirement (0 points)',
    isEligible: false,
  };
};

/**
 * Calculates overall attendance statistics for a specific student
 * @param {string} studentId 
 * @param {Array} attendanceRecords 
 * @returns {object} { totalLectures, presentLectures, absentLectures, percentage, rewardInfo }
 */
export const getStudentOverallAttendance = (studentId, attendanceRecords = []) => {
  const studentRecords = attendanceRecords.filter((r) => r.student_id === studentId);
  const totalLectures = studentRecords.length;
  const presentLectures = studentRecords.filter((r) => r.status === 'present').length;
  const absentLectures = totalLectures - presentLectures;
  const percentage = calculatePercentage(presentLectures, totalLectures);
  const rewardInfo = getRewardEligibility(percentage);

  return {
    totalLectures,
    presentLectures,
    absentLectures,
    percentage,
    rewardInfo,
  };
};

/**
 * Calculates subject-wise attendance statistics for a specific student
 * @param {string} studentId 
 * @param {Array} subjects 
 * @param {Array} attendanceRecords 
 * @returns {Array} List of subject statistics
 */
export const getStudentSubjectWiseAttendance = (studentId, subjects = [], attendanceRecords = []) => {
  return subjects.map((subject) => {
    const subjectRecords = attendanceRecords.filter(
      (r) => r.student_id === studentId && r.subject_id === subject.id
    );
    const total = subjectRecords.length;
    const present = subjectRecords.filter((r) => r.status === 'present').length;
    const percentage = calculatePercentage(present, total);

    return {
      subjectId: subject.id,
      subjectName: subject.subject_name,
      subjectCode: subject.subject_code,
      semester: subject.semester,
      totalLectures: total,
      presentLectures: present,
      absentLectures: total - present,
      percentage,
      status: percentage >= 75 ? 'Good' : 'At Risk',
    };
  });
};
