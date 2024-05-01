import axios from 'axios';

class UserService {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Gets the user info from the server, provided the user Id
     * @param userId the Id of the user to fetch
     * @returns The user object
     */
    async getUserInfo(userId) {
      throw new Error('Not implemented');
    }
}

export default UserService;
