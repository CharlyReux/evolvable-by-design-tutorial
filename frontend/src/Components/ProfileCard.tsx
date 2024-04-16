import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Button, Typography } from '@mui/material';
import { SemanticResource } from '@evolvable-by-design/pivo';
import { User } from '../Models/User';
import { useEffect, useState } from 'react';
import WithSemanticDataRequired from '../pivoUtils/WithSemanticDataRequired';

export default function ProfileCard(props: { user: SemanticResource, deleteUser: (user: SemanticResource) => Promise<void>}) {
    const deleteUser = props.deleteUser
    const [user, setUser] = useState<SemanticResource>(props.user)
    useEffect(() => {
        setUser(props.user)
        console.log(props.user.getRelation("http://myVoc.org/#rel/delete"))
    }, [props.user])

    return (
        <WithSemanticDataRequired
            data={user}
            mappings={{
                firstName: "https://schema.org/givenName",
                lastName: "https://schema.org/familyName",
                email: "https://schema.org/email",
                bio: "https://schema.org/abstract",
                createdAt: "https://schema.org/dateCreated"
            }}
            loader={<div>Loading...</div>}>
            {({ firstName, lastName, email, bio, createdAt }) => (

                <Card variant='outlined' sx={{ maxWidth: 400, margin: 'auto', marginTop: 20 }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ marginBottom: 2 }}>
                            {firstName} {lastName}
                        </Typography>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            Email: {email}
                        </Typography>
                        <Typography variant="body1" sx={{ marginBottom: 2 }}>
                            Bio: {bio}
                        </Typography>

                        <Typography variant="body2">
                            Created At: {createdAt}
                        </Typography>
                    </CardContent>
                    {(user.isRelationAvailable("http://myVoc.org/#rel/delete")) ? <Button onClick={() => deleteUser(user)}>delete User</Button> : ""}
                </Card>
            
            )}
        </WithSemanticDataRequired>
    )
}
