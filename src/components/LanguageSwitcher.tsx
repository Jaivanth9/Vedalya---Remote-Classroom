import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'hi' as const, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'te' as const, name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'pa' as const, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>{t('settings.language')}</CardTitle>
        </div>
        <CardDescription>{t('settings.selectLanguage')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="language-select">{t('settings.selectLanguage')}</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as typeof language)}>
            <SelectTrigger id="language-select" className="w-full">
              <SelectValue placeholder={t('settings.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lang.nativeName}</span>
                    <span className="text-muted-foreground ml-2">({lang.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            {t('settings.selectLanguage')} - {languages.find(l => l.code === language)?.nativeName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

