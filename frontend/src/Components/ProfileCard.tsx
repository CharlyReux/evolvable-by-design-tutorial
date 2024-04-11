import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { User } from '../Models/User';
import { useState } from 'react';
import { Typography } from '@mui/material';

export default function ProfileCard(props: { user: User }) {
    const user = props.user

    return (
        <Card variant='outlined' sx={{ maxWidth: 400, margin: 'auto', marginTop: 20 }}>
            <CardContent>
                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                    {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Email: {user.email}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                    Bio: {user.bio}
                </Typography>
                <Typography variant="body2">
                    Created At: {user.createdAt.toString()}
                </Typography>
            </CardContent>
        </Card>
    )
}
