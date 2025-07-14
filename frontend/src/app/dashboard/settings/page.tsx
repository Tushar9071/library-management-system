import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
      <p className="text-gray-600 dark:text-gray-300">Manage your application preferences and security.</p>

      {/* Notification Settings */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Notification Preferences</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Control how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-gray-700 dark:text-gray-300">
              Email Notifications
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="text-gray-700 dark:text-gray-300">
              SMS Notifications
            </Label>
            <Switch id="sms-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="app-notifications" className="text-gray-700 dark:text-gray-300">
              In-App Notifications
            </Label>
            <Switch id="app-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Change Password</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="text-gray-700 dark:text-gray-300">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="confirm-new-password" className="text-gray-700 dark:text-gray-300">
              Confirm New Password
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              className="mt-1 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
