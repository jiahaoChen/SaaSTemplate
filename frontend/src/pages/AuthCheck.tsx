import { useEffect } from 'react';
import { history, useModel } from '@umijs/max';

const AuthCheck: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    if (initialState?.currentUser) {
      // User is authenticated, redirect to dashboard
      history.push('/dashboard/analysis');
    } else {
      // User is not authenticated, redirect to landing page
      history.push('/landing');
    }
  }, [initialState]);

  return null; // This component doesn't render anything
};

export default AuthCheck;
