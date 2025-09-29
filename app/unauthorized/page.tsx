import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function UnauthorizedPage() {
    const t = await getTranslations("Status.unauthorized");

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
            <Card className="w-full max-w-md border-border/60 bg-background/80 backdrop-blur">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldOff className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            {t("title")}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            {t("description")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
                    <p>{t("hint")}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/auth/login">{t("actions.login")}</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="mailto:support@kacc.mn">{t("actions.support")}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}