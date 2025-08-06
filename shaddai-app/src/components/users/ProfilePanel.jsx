import React, { useState, useEffect } from "react";
import * as authApi from "./../../api/authApi";
import { useAuth } from "./../../context/AuthContext";
import MyProfile from "./MyProfile";

export default function () {

    const { token } = useAuth(); 
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!token) return;
        authApi.getProfile(token)
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null));
    }, [token]);

    return (
        <div>
            <MyProfile profile={profile} />
        </div>
    )
}