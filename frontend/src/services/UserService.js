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
      const response = await axios.get(`${this.baseUrl}/users/${userId}`)
      if (response.status !== 200) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
      }
      return response.data;
  }
}

export default UserService;
