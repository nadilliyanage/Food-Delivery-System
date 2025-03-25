import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';
import { getCurrentUser } from '../utils/auth';

const useUser = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  // Get user email either from auth context or localStorage
  const userEmail = user?.email || (getCurrentUser()?.email);
  
  const {data: currentUser, isLoading, refetch} = useQuery({
    queryKey: ['user', userEmail],
    queryFn: async () => {
      // First try to get user from localStorage as it may be more up-to-date
      const localUser = getCurrentUser();
      if (localUser) {
        return localUser;
      }
      
      // If no user in localStorage but we have an email, fetch from API
      if (userEmail) {
        const res = await axiosSecure.get(`/api/auth/user/${userEmail}`);
        return res.data;
      }
      
      return null;
    },
    enabled: !!userEmail && !!localStorage.getItem('token')
  });
  
  return {currentUser, isLoading, refetch};
}

export default useUser;