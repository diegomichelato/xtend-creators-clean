import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEmailAccount } from "@/hooks/useEmailAccounts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HelpCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const emailAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  provider: z.enum(["gmail", "smtp"]).default("gmail"),
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().min(1, "Password is required"),
  smtpSecure: z.boolean().default(true),
  dailyLimit: z.number().min(1).max(1000).default(100),
});

type EmailAccountFormData = z.infer<typeof emailAccountSchema>;

interface EmailAccountAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmailAccountAddDialog({
  open,
  onOpenChange,
}: EmailAccountAddDialogProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { toast } = useToast();
  const createEmailAccount = useCreateEmailAccount();

  const form = useForm<EmailAccountFormData>({
    resolver: zodResolver(emailAccountSchema),
    defaultValues: {
      provider: "gmail",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: true,
      dailyLimit: 100,
    },
  });

  const watchedProvider = form.watch("provider");

  // Update SMTP settings based on provider
  const handleProviderChange = (provider: "gmail" | "smtp") => {
    if (provider === "gmail") {
      form.setValue("smtpHost", "smtp.gmail.com");
      form.setValue("smtpPort", 587);
      form.setValue("smtpSecure", true);
    } else {
      form.setValue("smtpHost", "");
      form.setValue("smtpPort", 587);
    }
  };

  const onSubmit = async (values: EmailAccountFormData) => {
    try {
      await createEmailAccount.mutateAsync({
        name: values.name,
        email: values.email,
        provider: values.provider,
        smtp_host: values.smtpHost || "smtp.gmail.com",
        smtp_port: values.smtpPort || 587,
        smtp_username: values.smtpUsername || values.email,
        smtp_password: values.smtpPassword,
        smtp_secure: values.smtpSecure,
        daily_limit: values.dailyLimit,
      });

      toast({
        title: "Success",
        description: "Email account added successfully!",
      });

      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating email account:", error);
      toast({
        title: "Error",
        description: "Failed to add email account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Email Account</DialogTitle>
          <DialogDescription>
            Connect your email account to start sending campaigns. We support Gmail and custom SMTP servers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Gmail Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Provider Selection */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProviderChange(value as "gmail" | "smtp");
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="smtpPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedProvider === "gmail" ? "App Password" : "Password"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={watchedProvider === "gmail" ? "16-character app password" : "Your email password"} 
                      {...field} 
                    />
                  </FormControl>
                  {watchedProvider === "gmail" && (
                    <FormDescription className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                      <span className="text-sm">
                        You need a Gmail App Password. Go to your Google Account settings → Security → 2-Step Verification → App passwords to generate one.
                      </span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Advanced Settings */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" type="button" className="w-full justify-between">
                  Advanced Settings
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {watchedProvider === "smtp" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="587" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Usually your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpSecure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Use TLS/SSL</FormLabel>
                            <FormDescription>
                              Enable secure connection (recommended)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="dailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Email Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of emails to send per day (Gmail: 500, Others: varies)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createEmailAccount.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEmailAccount.isPending}
                className="min-w-[120px]"
              >
                {createEmailAccount.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Account"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}