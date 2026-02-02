interface RegisterBody {
    username: string;
    email: string;
    password: string;
    avatar?: string;
    language?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

export { RegisterBody, LoginBody };