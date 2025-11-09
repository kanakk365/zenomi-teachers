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

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  clinician: Clinician;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${baseURL}/clinicians/auth/register`, {
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
  const response = await fetch(`${baseURL}/clinicians/auth/login`, {
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
  const response = await fetch(`${baseURL}/clinicians/auth/profile`, {
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

