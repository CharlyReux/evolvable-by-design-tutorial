import axios from 'axios';
import { User } from '../Models/User';

class UserService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Gets the user info from the server, provided the user Id
     * @param userId the Id of the user to fetch
     * @returns The user object
     */
    async getUserInfo(userId: number): Promise<User> {
        const response = await axios.get(`${this.baseUrl}/users/${userId}`)
        if (response.status !== 200) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        return response.data as User;
    }
}

export default UserService;
