import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have shadcn Avatar

export default function ProfilePage() {
  // Placeholder for user data. In a real app, this would be fetched.
  const userData = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    bio: "A passionate librarian dedicated to fostering a love for reading and community engagement. Always eager to help patrons discover their next favorite book.",
    avatarUrl: "https://github.com/shadcn.png", // Placeholder avatar
    role: "Librarian",
    memberSince: "January 2020",
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        View and update your personal profile details.
      </p>

      <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={userData.avatarUrl || "/placeholder.svg"}
              alt={userData.fullName}
            />
            <AvatarFallback className="bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200 text-2xl font-semibold">
              {userData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-gray-900 dark:text-white text-2xl">
              {userData.fullName}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {userData.role} | Member since {userData.memberSince}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="fullName"
                className="text-gray-700 dark:text-gray-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                defaultValue={userData.fullName}
                className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue={userData.email}
                className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
              Bio
            </Label>
            <Textarea
              id="bio"
              defaultValue={userData.bio}
              rows={4}
              className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
