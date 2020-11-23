import { db } from "../../../database";

import { User } from "../../models";

export interface UserInterface {
    username: string;
    email?: string;
    password: string;
    simulations?: [{ simName: string, simID: string }];
}

export interface UserQueryInterface {
    username?: string;
    email?: string;
    password?: string;
}

export const createNewUser = async (newUserDetails: UserInterface) => {
    const execution = () => {
        User.find(newUserDetails, (err, res) => {
            if (res.length === 0) throw new Error("a user with that username already exists");
            const newUser = new User(newUserDetails);
            newUser.save();
        })
    };
    db({ callbacks: [execution] });
};

export const deleteExistingUser = (existingUserDetails: UserQueryInterface) => {
    const execution = () => {
        try {
            User.deleteOne(existingUserDetails);
        } catch (error) {
            throw error;
        }
    };
    db({ callbacks: [execution] });
};

export const doesUserExist = async (existingUserDetails: UserQueryInterface) => {
    const execution = () => {
        try {
            User.find(existingUserDetails, (err, res) => {
                if (err) throw err;
                if (res.length === 0) throw new Error("no documents returned from query");
            });
        } catch (error) {
            throw error;
        }
    }
    db({ callbacks: [execution] });
};