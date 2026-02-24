import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Shield, Bell, LogOut, Sun, Moon } from "lucide-react";

export default function Profile() {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    if (!user) return null;

    return (
        <div className="container max-w-4xl py-12 space-y-8 relative min-h-[calc(100vh-4rem)]">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Profile</span>
                </h1>
                <p className="text-lg text-muted-foreground">Manage your settings and wellbeing preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* User Card */}
                <Card className="md:col-span-1 bg-card/60 backdrop-blur-md border-primary/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="text-center pt-8 pb-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-4 shadow-inner relative">
                            <User className="h-10 w-10 text-primary relative z-10" />
                        </div>
                        <CardTitle className="text-xl">{user.email?.split('@')[0] || "User"}</CardTitle>
                        <CardDescription className="text-sm break-all">{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <Button variant="outline" className="w-full h-11 bg-background/50 border-primary/20 hover:bg-primary/10 transition-colors" onClick={signOut}>
                            <LogOut className="h-4 w-4 mr-2 text-destructive" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>

                {/* Settings Links */}
                <div className="md:col-span-2 space-y-4">
                    <Card className="bg-card/60 backdrop-blur-md border-primary/10 shadow-md">
                        <CardContent className="p-2">
                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Settings className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Account Settings</h3>
                                        <p className="text-sm text-muted-foreground">Update password & details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors" onClick={toggleTheme}>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                        {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Appearance</h3>
                                        <p className="text-sm text-muted-foreground">Toggle light/dark mode</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-secondary text-secondary-foreground">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Notifications</h3>
                                        <p className="text-sm text-muted-foreground">Manage alerts and reminders</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-warning/20 text-warning-foreground pb-2">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Privacy & Data</h3>
                                        <p className="text-sm text-muted-foreground">Manage your wellbeing data</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
