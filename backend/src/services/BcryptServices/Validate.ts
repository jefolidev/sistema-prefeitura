import { compareSync } from "bcrypt";

const Validate = async (password: string, hash: string): Promise<boolean> => {

    return compareSync(password, hash);

};

export default Validate;