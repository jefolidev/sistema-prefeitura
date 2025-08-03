import { hashSync } from "bcrypt";
import auth from "../../config/auth";

const CreateHash = async (password: string): Promise<string> => {

    const hash:string = hashSync(password, auth.saltHash);
    return hash;

};

export default CreateHash;