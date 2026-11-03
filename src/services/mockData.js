// Initial mock dataset for local demo mode, offline testing, or before Supabase credentials are bound.

export const initialProfiles = [
  {
    id: 'admin-001',
    full_name: 'Dr. Rajesh Mehta',
    email: 'admin@college.edu',
    role: 'admin',
    student_id: null,
    wallet_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'faculty-001',
    full_name: 'Prof. Sunita Sharma',
    email: 'prof.sharma@college.edu',
    role: 'faculty',
    student_id: null,
    wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    created_at: '2026-01-11T10:00:00Z',
  },
  {
    id: 'faculty-002',
    full_name: 'Prof. Vikram Verma',
    email: 'prof.verma@college.edu',
    role: 'faculty',
    student_id: null,
    wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'student-001',
    full_name: 'Rahul Kumar',
    email: 'rahul.kumar@college.edu',
    role: 'student',
    student_id: 'CSE-2023-001',
    wallet_address: '0x71C63dd547B6F3952a25dfEBc7E3f0559fF3740D',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'student-002',
    full_name: 'Priya Singh',
    email: 'priya.singh@college.edu',
    role: 'student',
    student_id: 'CSE-2023-002',
    wallet_address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    created_at: '2026-01-15T09:15:00Z',
  },
  {
    id: 'student-003',
    full_name: 'Ananya Patel',
    email: 'ananya.patel@college.edu',
    role: 'student',
    student_id: 'CSE-2023-003',
    wallet_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    created_at: '2026-01-15T09:30:00Z',
  },
  {
    id: 'student-004',
    full_name: 'Amit Sharma',
    email: 'amit.sharma@college.edu',
    role: 'student',
    student_id: 'CSE-2023-004',
    wallet_address: '0x976EA74026E72CD111245781aAcB7Ce40A0F7E04',
    created_at: '2026-01-15T09:45:00Z',
  },
  {
    id: 'student-005',
    full_name: 'Rohan Gupta',
    email: 'rohan.gupta@college.edu',
    role: 'student',
    student_id: 'CSE-2023-005',
    wallet_address: '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
    created_at: '2026-01-15T10:00:00Z',
  },
];

export const initialSubjects = [
  {
    id: 'subj-001',
    subject_name: 'Blockchain Architecture & Protocols',
    subject_code: 'CS401',
    faculty_id: 'faculty-001',
    semester: 6,
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'subj-002',
    subject_name: 'Distributed Systems & Cloud',
    subject_code: 'CS402',
    faculty_id: 'faculty-001',
    semester: 6,
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'subj-003',
    subject_name: 'Applied Cryptography & Network Security',
    subject_code: 'CS403',
    faculty_id: 'faculty-002',
    semester: 6,
    created_at: '2026-01-13T10:00:00Z',
  },
  {
    id: 'subj-004',
    subject_name: 'Smart Contract Development & Auditing',
    subject_code: 'CS404',
    faculty_id: 'faculty-002',
    semester: 6,
    created_at: '2026-01-13T10:00:00Z',
  },
];

// Helper to generate seed attendance records across 10 lecture dates
const dates = [
  '2026-03-02',
  '2026-03-04',
  '2026-03-09',
  '2026-03-11',
  '2026-03-16',
  '2026-03-18',
  '2026-03-23',
  '2026-03-25',
  '2026-03-30',
  '2026-04-01',
];

const generateInitialAttendance = () => {
  const records = [];
  let idCounter = 1;

  // Student 001 (Rahul): 95% attendance (present in almost all)
  // Student 002 (Priya): 80% attendance (absent on 2 dates)
  // Student 003 (Ananya): 100% attendance (present in all)
  // Student 004 (Amit): 60% attendance (absent on 4 dates)
  // Student 005 (Rohan): 85% attendance (absent on 1-2 dates)

  const studentProfiles = ['student-001', 'student-002', 'student-003', 'student-004', 'student-005'];
  const subjects = ['subj-001', 'subj-002', 'subj-003', 'subj-004'];

  dates.forEach((date, dateIdx) => {
    subjects.forEach((subjId) => {
      const markedBy = subjId === 'subj-001' || subjId === 'subj-002' ? 'faculty-001' : 'faculty-002';
      
      studentProfiles.forEach((studentId) => {
        let isPresent = true;
        if (studentId === 'student-004') {
          // Amit is absent on even index dates (lower attendance <75%)
          if (dateIdx % 2 === 0) isPresent = false;
        } else if (studentId === 'student-002') {
          // Priya absent on index 3 and 7 (approx 80%)
          if (dateIdx === 3 || dateIdx === 7) isPresent = false;
        } else if (studentId === 'student-001') {
          // Rahul absent on index 5 (approx 90-95%)
          if (dateIdx === 5 && subjId === 'subj-002') isPresent = false;
        } else if (studentId === 'student-005') {
          // Rohan absent on index 4 and 8 for subj-001
          if ((dateIdx === 4 || dateIdx === 8) && (subjId === 'subj-001' || subjId === 'subj-003')) isPresent = false;
        }
        // Ananya student-003 is always present (100%)

        records.push({
          id: `att-${idCounter++}`,
          student_id: studentId,
          subject_id: subjId,
          attendance_date: date,
          status: isPresent ? 'present' : 'absent',
          marked_by: markedBy,
          created_at: `${date}T10:30:00Z`,
        });
      });
    });
  });

  return records;
};

export const initialAttendance = generateInitialAttendance();

export const initialRewards = [
  {
    id: 'rew-001',
    student_id: 'student-003',
    semester_id: 6,
    attendance_percentage: 100.0,
    reward_points: 50,
    transaction_hash: '0x8f2d8a594892cbe38204b7bca0f074d68d14872f0db3815259ce34b9d5292c3a',
    status: 'confirmed',
    created_at: '2026-04-05T14:20:00Z',
  },
];
