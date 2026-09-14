// Authentication & Role-Based Access Control for UniWorkload AI
// Supports NSRU institutional accounts, Super Admin (tie), faculty members, and staff.

export const SUPER_ADMIN_ACCOUNT = {
  id: "user-superadmin-tie",
  username: "admin",
  email: "admin@nsru.ac.th",
  name: "นายธนภัทร สุขเกษม (tie)",
  role: "superadmin", // 'superadmin' | 'admin' | 'faculty' | 'head'
  roleLabel: "👑 ผู้ดูแลระบบสูงสุด (Super Admin)",
  department: "สาขาวิชาเทคโนโลยีสารสนเทศ",
  faculty: "คณะวิทยาการจัดการ",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  facultyId: "fac-1",
  isSuperAdmin: true,
  permissions: ["all", "manage_all_faculties", "upload_orders", "delete_orders", "export_all_eportfolio", "system_settings"]
};

export const DEMO_PRESET_ACCOUNTS = [
  {
    label: "👑 ผู้ดูแลระบบสูงสุด (tie)",
    sublabel: "สิทธิ์สูงสุด Full Access ทุกคณะ",
    username: "admin",
    passwordHint: "2547",
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    account: SUPER_ADMIN_ACCOUNT
  },
  {
    label: "👩‍🏫 อ.พิมรา ทองแสง",
    sublabel: "อาจารย์ / รองผู้อำนวยการ (สาธารณสุข)",
    username: "pimra.t@nsru.ac.th",
    passwordHint: "1234",
    color: "from-sky-500 to-blue-600",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    account: {
      id: "user-pimra",
      username: "pimra.t@nsru.ac.th",
      email: "pimra.t@nsru.ac.th",
      name: "อ.พิมรา ทองแสง",
      role: "faculty",
      roleLabel: "อาจารย์ / รองผู้อำนวยการ",
      department: "สาขาวิชาสาธารณสุขศาสตร์",
      faculty: "คณะวิทยาศาสตร์และเทคโนโลยี",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      facultyId: "fac-pimra",
      isSuperAdmin: false,
      permissions: ["view_own_drawer", "upload_own_evidence", "export_own_eportfolio"]
    }
  },
  {
    label: "👨‍🏫 ผศ.ดร.สมชาย ใจดี",
    sublabel: "หัวหน้าสาขาวิชาเทคโนโลยีสารสนเทศ",
    username: "somchai.j@nsru.ac.th",
    passwordHint: "1234",
    color: "from-indigo-500 to-purple-600",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    account: {
      id: "user-somchai",
      username: "somchai.j@nsru.ac.th",
      email: "somchai.j@nsru.ac.th",
      name: "ผศ.ดร.สมชาย ใจดี",
      role: "head",
      roleLabel: "หัวหน้าสาขาวิชาเทคโนโลยีสารสนเทศ",
      department: "สาขาวิชาเทคโนโลยีสารสนเทศ",
      faculty: "คณะวิทยาการจัดการ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      facultyId: "fac-2",
      isSuperAdmin: false,
      permissions: ["view_department_summary", "view_own_drawer", "upload_own_evidence"]
    }
  },
  {
    label: "🏢 ธุรการคณะ (งานสารบรรณ)",
    sublabel: "สแกน & สกัดคำสั่ง AI กระจายงาน",
    username: "staff@nsru.ac.th",
    passwordHint: "1234",
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    account: {
      id: "user-staff",
      username: "staff@nsru.ac.th",
      email: "staff@nsru.ac.th",
      name: "เจ้าหน้าที่งานสารบรรณ คณะวิทยาการจัดการ",
      role: "admin",
      roleLabel: "ธุรการคณะ / งานสารบรรณ",
      department: "งานบริหารทั่วไปและสารบรรณ",
      faculty: "คณะวิทยาการจัดการ",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      facultyId: "fac-1",
      isSuperAdmin: false,
      permissions: ["upload_orders", "distribute_orders", "view_faculty_list"]
    }
  }
];

const AUTH_STORAGE_KEY = 'uniworkload_auth_session';

/**
 * Attempt login with username/email and password
 * @param {string} identifier - 'admin', 'admin@nsru.ac.th', or faculty email
 * @param {string} password - '2547' for superadmin, '1234' for demo faculties
 * @param {Array} dynamicFaculties - current list of faculties for dynamic matching
 */
export function authenticateUser(identifier, password, dynamicFaculties = []) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. Check Super Admin (tie) - accepts 'admin', 'admin@nsru.ac.th', or 'thanaphat.s@nsru.ac.th' with password '2547'
  if (
    (cleanId === 'admin' || 
     cleanId === 'admin@nsru.ac.th' || 
     cleanId === 'thanaphat.s@nsru.ac.th' || 
     cleanId === 'tie' || 
     cleanId === 'xiantin') && 
    cleanPass === '2547'
  ) {
    return {
      success: true,
      user: {
        ...SUPER_ADMIN_ACCOUNT,
        loginTime: new Date().toISOString()
      }
    };
  }

  // 2. Check predefined demo accounts
  for (const preset of DEMO_PRESET_ACCOUNTS) {
    if (
      (cleanId === preset.username.toLowerCase() || cleanId === preset.account.email?.toLowerCase()) &&
      cleanPass === preset.passwordHint
    ) {
      return {
        success: true,
        user: {
          ...preset.account,
          loginTime: new Date().toISOString()
        }
      };
    }
  }

  // 3. Dynamic faculty matching (matches any faculty registered in the system)
  if (dynamicFaculties && dynamicFaculties.length > 0) {
    const matchedFac = dynamicFaculties.find(
      (f) => f.email?.toLowerCase() === cleanId || f.id.toLowerCase() === cleanId
    );

    if (matchedFac) {
      // Default fallback password for faculty is 1234, or 2547 if it's tie's profile
      const isValid = cleanPass === '1234' || (matchedFac.id === 'fac-1' && cleanPass === '2547');
      if (isValid) {
        const isTie = matchedFac.id === 'fac-1' || matchedFac.email?.includes('thanaphat');
        return {
          success: true,
          user: {
            id: `user-${matchedFac.id}`,
            username: matchedFac.email,
            email: matchedFac.email,
            name: matchedFac.name,
            role: isTie ? 'superadmin' : 'faculty',
            roleLabel: isTie ? '👑 ผู้ดูแลระบบสูงสุด (tie)' : (matchedFac.role || 'อาจารย์ผู้สอน'),
            department: matchedFac.department,
            faculty: matchedFac.faculty,
            avatar: matchedFac.avatar,
            facultyId: matchedFac.id,
            isSuperAdmin: isTie,
            permissions: isTie ? ["all"] : ["view_own_drawer", "upload_own_evidence", "export_own_eportfolio"],
            loginTime: new Date().toISOString()
          }
        };
      }
    }
  }

  return {
    success: false,
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดสอบ Super Admin: admin / 2547 หรือ อาจารย์: 1234)'
  };
}

/**
 * Get stored session from localStorage
 */
export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse auth session:', e);
    return null;
  }
}

/**
 * Store session to localStorage
 */
export function storeSession(user) {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save auth session:', e);
  }
}

/**
 * Clear session
 */
export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}
