import axios from 'axios';
import { User } from '../Models/User';

class ProfileService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getUserInfo(userId: number): Promise<User> {
        const response = await axios.get(`${this.baseUrl}/users/${userId}`)
        if (response.status !== 200) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        return response.data as User;

    }
}

export default ProfileService;
