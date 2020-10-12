import { db } from "../../../database";

import { User } from "../../models";

export interface UserInterface {
    username: string;
    email: string;
    password: string;
}

export interface UserQueryInterface {
    username?: string;
    email?: string;
    password?: string;
}

export const createNewUser = (newUserDetails: UserInterface) => {
    const execution = () => {
        const newUser = new User(newUserDetails);
        newUser.save();
    };
    db({ callbacks: [execution] });
};

export const deleteExistingUser = (existingUserDetails: UserQueryInterface) => {
    const execution = () => {
        try {
            User.deleteOne(existingUserDetails);
        } catch (error) {
            console.error(error);
        }
    };
    db({ callbacks: [execution] });
};

export const doesUserExist = (existingUserDetails: UserQueryInterface) => {
    let result = null;
    const execution = () => {
        try {
            User.find(existingUserDetails).exec((err, users) => {
                result = users.length > 0;
            });
        } catch (error) {
            console.error(error);
        }
    };
    db({ callbacks: [execution] });
    return result;
};
