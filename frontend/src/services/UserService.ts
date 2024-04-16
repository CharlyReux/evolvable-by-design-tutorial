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
      throw new Error('Not implemented');
    }
}

export default UserService;
