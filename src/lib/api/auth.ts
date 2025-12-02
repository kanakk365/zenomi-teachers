interface SignupData {
  clinicianName: string;
  address: string;
  phoneNumber: string;
  email: string;
  password: string;
  ownerName: string;
  licenseNumber: string;
  position: string;
  website?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface Clinician {
  id: string;
  email: string;
  clinicianName: string;
  ownerName: string;
  licenseNumber: string;
  position: string;
  website?: string;
}

interface PlanAccess {
  isStandardPaid: boolean;
  isPremiumPaid: boolean;
  courses: Array<{ id: string; name: string; link: string }>;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  clinician: Clinician;
  planAccess: PlanAccess;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${baseURL}/teachers/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  return response.json();
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${baseURL}/teachers/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function getProfile(accessToken: string): Promise<Clinician> {
  const response = await fetch(`${baseURL}/teachers/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
}

interface Course {
  id: string;
  name: string;
  link: string;
}

interface AllCourse {
  id: string;
  name: string;
}

interface CoursesResponse {
  isStandardPaid: boolean;
  isPremiumPaid: boolean;
  courses: Course[];
  allCourses: AllCourse[];
}

export async function getCourses(accessToken: string): Promise<CoursesResponse> {
  const response = await fetch(`${baseURL}/teachers/courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch courses');
  }

  return response.json();
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
}

export async function checkoutStandard(
  accessToken: string,
  courseIds: string[]
): Promise<CheckoutResponse> {
  const amount = courseIds.length * 499;
  
  const response = await fetch(`${baseURL}/payments/teachers/checkout/standard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount,
      currency: 'inr',
      description: 'Standard Plan',
      courseIds,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Checkout failed');
  }

  return response.json();
}

export async function checkoutPremium(
  accessToken: string
): Promise<CheckoutResponse> {
  const amount = 499 * 6;
  
  const response = await fetch(`${baseURL}/payments/teachers/checkout/premium`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Checkout failed');
  }

  return response.json();
}

