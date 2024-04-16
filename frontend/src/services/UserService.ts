import axios from 'axios';
import Pivo, { SemanticResource } from '@evolvable-by-design/pivo';

class UserService {
    private pivo: Pivo;

    constructor(documentation: any) {
        this.pivo = new Pivo(documentation);
    }

    static async forApiAtUrl(url: string) {
        const response = await axios.get(url)

        if (response.status === 200) {
            console.log(response.data)
            return new UserService(response.data)
        } else {
            const errorMessage = `Impossible to get the documentation of the API at ${url}.`
            alert(errorMessage)
            throw new Error(errorMessage)
        }
    }


    /**
     * Gets the user info from the server, provided the user Id
     * @param userId the Id of the user to fetch
     * @returns The user object
     */
    async getUserInfo(userId: number): Promise<SemanticResource> {


        const getOperation = this.pivo
            .get("http://myVoc.org/vocab#user")
            .getOrThrow(() => new Error("No operations found for fetching user info."))

        const response = await getOperation.invoke({ ["https://schema.org/identifier"]: userId })

        if (response.status !== 200) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        return response.data;
    }
}

export default UserService;
