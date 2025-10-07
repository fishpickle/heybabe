import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function AuthIndex() {
  useEffect(() => {
    console.log("🔄 Auth index redirecting to login...");
  }, []);

  console.log("🔄 Auth index rendering redirect to /auth/login");
  return <Redirect href="/auth/login" />;
}
