import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, RefreshCw, DollarSign, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data: exchangeData, isLoading } = trpc.settings.getExchangeRate.useQuery();
  const { data: kuraimiData, isLoading: kuraimiLoading } = trpc.settings.getKuraimiSettings.useQuery();
  const updateMutation = trpc.settings.updateExchangeRate.useMutation();
  const updateKuraimiMutation = trpc.settings.updateKuraimiSettings.useMutation();
  const utils = trpc.useUtils();

  const [rate, setRate] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Kuraimi state
  const [kuraimiEnabled, setKuraimiEnabled] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountUSD, setAccountUSD] = useState("");
  const [accountYER, setAccountYER] = useState("");
  const [accountSAR, setAccountSAR] = useState("");
  const [instructions, setInstructions] = useState("");
  const [instructionsAr, setInstructionsAr] = useState("");
  const [hasKuraimiChanges, setHasKuraimiChanges] = useState(false);

  useEffect(() => {
    if (exchangeData) {
      setRate(String(exchangeData.rate));
      setEnabled(exchangeData.enabled);
    }
  }, [exchangeData]);

  useEffect(() => {
    if (kuraimiData) {
      setKuraimiEnabled(kuraimiData.enabled);
      setBeneficiaryName(kuraimiData.beneficiaryName);
      setAccountUSD(kuraimiData.accountUSD);
      setAccountYER(kuraimiData.accountYER);
      setAccountSAR(kuraimiData.accountSAR);
      setInstructions(kuraimiData.instructions || "");
      setInstructionsAr(kuraimiData.instructionsAr || "");
    }
  }, [kuraimiData]);

  const handleRateChange = (val: string) => {
    setRate(val);
    setHasChanges(true);
  };

  const handleEnabledChange = (val: boolean) => {
    setEnabled(val);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum <= 0) {
      toast.error("Please enter a valid exchange rate");
      return;
    }
    try {
      await updateMutation.mutateAsync({ rate: rateNum, enabled });
      utils.settings.getExchangeRate.invalidate();
      setHasChanges(false);
      toast.success("Exchange rate updated successfully");
    } catch {
      toast.error("Failed to update exchange rate");
    }
  };

  const handleKuraimiSave = async () => {
    if (kuraimiEnabled && (!beneficiaryName.trim() || !accountUSD.trim() || !accountYER.trim() || !accountSAR.trim())) {
      toast.error("Please fill in all Kuraimi account details");
      return;
    }
    try {
      await updateKuraimiMutation.mutateAsync({
        enabled: kuraimiEnabled,
        beneficiaryName: beneficiaryName.trim(),
        accountUSD: accountUSD.trim(),
        accountYER: accountYER.trim(),
        accountSAR: accountSAR.trim(),
        instructions: instructions.trim(),
        instructionsAr: instructionsAr.trim(),
      });
      utils.settings.getKuraimiSettings.invalidate();
      setHasKuraimiChanges(false);
      toast.success("Kuraimi settings updated successfully");
    } catch {
      toast.error("Failed to update Kuraimi settings");
    }
  };

  // Example calculation
  const exampleSAR = 100;
  const exampleYER = parseFloat(rate) > 0 ? exampleSAR * parseFloat(rate) : 0;

  if (isLoading || kuraimiLoading) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <div className="container py-8 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Store Settings
            </h1>
            <p className="text-sm text-muted-foreground">Manage exchange rates, currency display, and payment methods</p>
          </div>
        </div>

        {/* Exchange Rate Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-gold" />
              </div>
              <div>
                <CardTitle className="text-lg">Currency Exchange Rate</CardTitle>
                <CardDescription>
                  Set the exchange rate from Saudi Riyal (SAR) to Yemeni Rial (YER).
                  When enabled, YER prices will appear alongside SAR prices.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl">
              <div>
                <Label className="text-sm font-semibold">Show YER Prices</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Display Yemeni Rial prices alongside Saudi Riyal
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={handleEnabledChange}
              />
            </div>

            {/* Exchange Rate Input */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Exchange Rate (1 SAR = ? YER)</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/40 rounded-lg text-sm font-medium">
                  <span>1 SAR</span>
                  <span className="text-muted-foreground">=</span>
                </div>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder="250"
                  className="max-w-[200px] text-lg font-semibold"
                  step="0.01"
                  min="0.01"
                />
                <span className="text-sm font-medium text-muted-foreground">YER</span>
              </div>
            </div>

            {/* Preview */}
            {enabled && parseFloat(rate) > 0 && (
              <div className="p-4 bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl border border-gold/20">
                <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">Preview</p>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{exampleSAR.toFixed(2)}</span>
                    <span className="text-sm font-semibold">SAR</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base text-muted-foreground font-medium">
                      {exampleYER.toLocaleString("en", { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-muted-foreground">YER</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 rounded-full px-6"
              >
                {updateMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              {hasChanges && (
                <span className="text-xs text-muted-foreground">You have unsaved changes</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kuraimi Payment Settings Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Kuraimi Bank Transfer</CardTitle>
                <CardDescription>
                  Configure Kuraimi bank transfer payment method. Customers can transfer money to your accounts and provide the transfer reference number.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl">
              <div>
                <Label className="text-sm font-semibold">Enable Kuraimi Payment</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show Kuraimi bank transfer as a payment option at checkout
                </p>
              </div>
              <Switch
                checked={kuraimiEnabled}
                onCheckedChange={(val) => { setKuraimiEnabled(val); setHasKuraimiChanges(true); }}
              />
            </div>

            {/* Beneficiary Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Beneficiary Name (اسم المستفيد)</Label>
              <Input
                value={beneficiaryName}
                onChange={(e) => { setBeneficiaryName(e.target.value); setHasKuraimiChanges(true); }}
                placeholder="محمد شاكر عبداللطيف سيف"
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">The name that will appear to customers for the bank transfer</p>
            </div>

            {/* Account Numbers */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Account Numbers (أرقام الحسابات)</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* USD Account */}
                <div className="space-y-1.5 p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">USD $</span>
                    <Label className="text-xs font-semibold">Dollar Account</Label>
                  </div>
                  <Input
                    value={accountUSD}
                    onChange={(e) => { setAccountUSD(e.target.value); setHasKuraimiChanges(true); }}
                    placeholder="123456789"
                    className="text-sm font-mono"
                  />
                </div>

                {/* YER Account */}
                <div className="space-y-1.5 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">YER</span>
                    <Label className="text-xs font-semibold">Yemeni Account</Label>
                  </div>
                  <Input
                    value={accountYER}
                    onChange={(e) => { setAccountYER(e.target.value); setHasKuraimiChanges(true); }}
                    placeholder="123456789"
                    className="text-sm font-mono"
                  />
                </div>

                {/* SAR Account */}
                <div className="space-y-1.5 p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">SAR</span>
                    <Label className="text-xs font-semibold">Saudi Account</Label>
                  </div>
                  <Input
                    value={accountSAR}
                    onChange={(e) => { setAccountSAR(e.target.value); setHasKuraimiChanges(true); }}
                    placeholder="123456789"
                    className="text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Instructions (English)</Label>
                <Input
                  value={instructions}
                  onChange={(e) => { setInstructions(e.target.value); setHasKuraimiChanges(true); }}
                  placeholder="Transfer the amount to one of the accounts below"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">التعليمات (عربي)</Label>
                <Input
                  value={instructionsAr}
                  onChange={(e) => { setInstructionsAr(e.target.value); setHasKuraimiChanges(true); }}
                  placeholder="حوّل المبلغ إلى أحد الحسابات أدناه"
                  className="text-sm"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleKuraimiSave}
                disabled={!hasKuraimiChanges || updateKuraimiMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
              >
                {updateKuraimiMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Kuraimi Settings
              </Button>
              {hasKuraimiChanges && (
                <span className="text-xs text-muted-foreground">You have unsaved changes</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
