// Authentication & Role-Based Access Control for UniWorkload AI
// Supports NSRU institutional accounts, Super Admin (tie), faculty members, and staff.

export const SUPER_ADMIN_ACCOUNT = {
  id: "user-superadmin-tie",
  username: "admin",
  email: "admin@nsru.ac.th",
  name: "นายศุภกร คงไข่ (tie)",
  role: "superadmin", // 'superadmin' | 'coadmin' | 'admin' | 'faculty' | 'head'
  roleLabel: "👑 ผู้ดูแลระบบสูงสุด (Super Admin)",
  department: "ผู้พัฒนาระบบ UniWorkload AI",
  faculty: "คณะวิทยาการจัดการ",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  facultyId: null, // tie is the system creator/admin, not in the faculty workload list
  isSuperAdmin: true,
  isCoAdmin: false,
  canSwitchFaculty: true,
  permissions: ["all", "manage_all_faculties", "upload_orders", "delete_orders", "export_all_eportfolio", "system_settings", "view_all_drawers"]
};

export const CO_ADMIN_PIMMY_ACCOUNT = {
  id: "user-coadmin-pimmy",
  username: "pimmy",
  email: "pimmy@nsru.ac.th",
  name: "พิมมี่ (Pimmy)",
  role: "coadmin", // รองผู้ดูแลระบบสูงสุด (คู่พัฒนาของ tie)
  roleLabel: "🛡️ รองผู้ดูแลระบบสูงสุด (Co-Admin)",
  department: "ผู้พัฒนาระบบร่วม UniWorkload AI",
  faculty: "คณะวิทยาการจัดการ",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  facultyId: null, // pimmy is tie's project partner, not an instructor
  isSuperAdmin: false,
  isCoAdmin: true,
  canSwitchFaculty: true,
  permissions: [
    "all_management",
    "manage_all_faculties",
    "upload_orders",
    "distribute_orders",
    "export_all_eportfolio",
    "view_all_drawers"
  ]
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
    label: "🛡️ รองผู้ดูแลระบบสูงสุด (Pimmy)",
    sublabel: "สิทธิ์ระดับบริหาร คู่ของ tie (สลับดูอาจารย์ทุกคนได้)",
    username: "pimmy",
    passwordHint: "1234",
    color: "from-purple-500 to-indigo-600",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    account: CO_ADMIN_PIMMY_ACCOUNT
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
      isCoAdmin: false,
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
      permissions: ["upload_orders", "distribute_orders", "view_faculty_list", "view_all_drawers"]
    }
  }
];

/**
 * Check if the user has permission to view all faculties / switch between faculty drawers
 * Only Super Admin, Co-Admin, Admin, and Staff (งานธุรการ/สารบรรณ) are allowed.
 * Regular instructors (อาจารย์) can ONLY view their own drawer.
 */
export function canViewAllFaculties(user) {
  if (!user) return false;
  if (user.isSuperAdmin || user.isCoAdmin) return true;
  const role = (user.role || '').toLowerCase();
  if (['superadmin', 'coadmin', 'admin', 'staff'].includes(role)) return true;
  const label = (user.roleLabel || '').toLowerCase();
  if (label.includes('ธุรการ') || label.includes('สารบรรณ') || label.includes('ผู้ดูแล') || label.includes('admin')) {
    return true;
  }
  return false;
}

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

  // 1. Check Super Admin (tie: นายศุภกร คงไข่) - accepts 'admin', 'admin@nsru.ac.th', 'suphakon', 'suphakon.k@nsru.ac.th', 'tie', 'xiantin' with password '2547'
  if (
    (cleanId === 'admin' || 
     cleanId === 'admin@nsru.ac.th' || 
     cleanId === 'suphakon' || 
     cleanId === 'suphakon.k@nsru.ac.th' || 
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

  // 2. Check Co-Admin (pimmy: พิมมี่ คู่ของ tie) - accepts 'pimmy', 'pimmy@nsru.ac.th' with password '1234'
  if (
    (cleanId === 'pimmy' || 
     cleanId === 'pimmy@nsru.ac.th') && 
    cleanPass === '1234'
  ) {
    return {
      success: true,
      user: {
        ...CO_ADMIN_PIMMY_ACCOUNT,
        loginTime: new Date().toISOString()
      }
    };
  }

  // 3. Check predefined demo accounts
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

  // 4. Dynamic faculty matching (matches any faculty registered in the system)
  if (dynamicFaculties && dynamicFaculties.length > 0) {
    const matchedFac = dynamicFaculties.find(
      (f) => f.email?.toLowerCase() === cleanId || f.id.toLowerCase() === cleanId
    );

    if (matchedFac) {
      // Default fallback password for faculty is 1234
      const isValid = cleanPass === '1234';
      if (isValid) {
        return {
          success: true,
          user: {
            id: `user-${matchedFac.id}`,
            username: matchedFac.email,
            email: matchedFac.email,
            name: matchedFac.name,
            role: 'faculty',
            roleLabel: matchedFac.role || 'อาจารย์ผู้สอน',
            department: matchedFac.department,
            faculty: matchedFac.faculty,
            avatar: matchedFac.avatar,
            facultyId: matchedFac.id,
            isSuperAdmin: false,
            isCoAdmin: false,
            canSwitchFaculty: false,
            permissions: ["view_own_drawer", "upload_own_evidence", "export_own_eportfolio"],
            loginTime: new Date().toISOString()
          }
        };
      }
    }
  }

  return {
    success: false,
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง'
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
