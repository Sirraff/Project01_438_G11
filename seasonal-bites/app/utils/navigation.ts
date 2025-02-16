export type RootStackParamList = {
    Menu: undefined;
    CreateAccount: undefined;
    Login: undefined;
    LocationSettings: undefined;
    Loading: undefined;
    Search: { userData: { name_user: string; location: string; last_login: number; base_id: string } | null };
    Favorites: { userData: { name_user: string; location: string; last_login: number; base_id: string } | null };
    Settings: { userData: { name_user: string; location: string; last_login: number; base_id: string } | null };
   
};