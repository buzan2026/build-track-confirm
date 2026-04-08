import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell, Mail, Smartphone, CalendarClock,
  CheckCircle, Truck, Package, AlertTriangle, FileText, Clock, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/* ── Event type metadata ── */
const eventMeta: Record<string, { label: string; description: string; icon: typeof Bell }> = {
  order_confirmed: { label: "Order confirmed", description: "When a new order is confirmed by the supplier", icon: CheckCircle },
  being_prepared: { label: "Being prepared", description: "When an order starts being prepared in the warehouse", icon: Package },
  in_transit: { label: "In transit", description: "When a shipment is dispatched and on its way", icon: Truck },
  delivered: { label: "Delivered", description: "When a shipment has been delivered to the site", icon: CheckCircle },
  partially_delivered: { label: "Partially delivered", description: "When only some items from an order are delivered", icon: Package },
  delayed: { label: "Delayed", description: "When a delivery date is pushed back", icon: AlertTriangle },
  date_changed: { label: "Date changed", description: "When the expected delivery date is modified", icon: CalendarClock },
  backorder_update: { label: "Backorder update", description: "When backordered items have availability updates", icon: RotateCcw },
  invoice_available: { label: "Invoice available", description: "When a new invoice or credit note is ready", icon: FileText },
};

type ChannelKey = "email" | "push" | "daily_digest";

const channels: { key: ChannelKey; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
  { key: "daily_digest", label: "Daily digest", icon: CalendarClock },
];

interface NotifPref {
  id: string;
  event_type: string;
  email: boolean;
  push: boolean;
  daily_digest: boolean;
}

function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification_preferences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notification_preferences").select("*").order("event_type");
      if (error) throw error;
      return data as NotifPref[];
    },
  });
}

export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const { data: prefs, isLoading } = useNotificationPreferences();

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: ChannelKey; value: boolean }) => {
      const { error } = await supabase
        .from("notification_preferences")
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["notification_preferences"] });
      const prev = queryClient.getQueryData<NotifPref[]>(["notification_preferences"]);
      queryClient.setQueryData<NotifPref[]>(["notification_preferences"], (old) =>
        old?.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["notification_preferences"], ctx.prev);
      toast.error("Failed to update preference");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_preferences"] });
    },
  });

  const toggleAll = (field: ChannelKey, value: boolean) => {
    prefs?.forEach((p) => {
      if (p[field] !== value) {
        updateMutation.mutate({ id: p.id, field, value });
      }
    });
  };

  const allChecked = (field: ChannelKey) => prefs?.every((p) => p[field]) ?? false;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
          Notification Preferences
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Choose how you want to be notified for each event type
        </p>
      </div>

      {/* Table */}
      <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] overflow-hidden shadow-[var(--shadow-1)]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px_100px] items-center border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] px-5 py-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Event</span>
          {channels.map((ch) => (
            <div key={ch.key} className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">{ch.label}</span>
              <Switch
                checked={allChecked(ch.key)}
                onCheckedChange={(v) => toggleAll(ch.key, v)}
                className="scale-75"
              />
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {prefs?.map((pref) => {
            const meta = eventMeta[pref.event_type];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <div
                key={pref.id}
                className="grid grid-cols-[1fr_80px_80px_100px] items-center px-5 py-3.5 hover:bg-[var(--color-bg-layer-01)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-layer-01)] text-[var(--color-text-secondary)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{meta.label}</p>
                    <p className="text-xs text-[var(--color-text-helper)] truncate">{meta.description}</p>
                  </div>
                </div>
                {channels.map((ch) => (
                  <div key={ch.key} className="flex justify-center">
                    <Switch
                      checked={pref[ch.key]}
                      onCheckedChange={(v) => updateMutation.mutate({ id: pref.id, field: ch.key, value: v })}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-helper)]">
        Changes are saved automatically. Daily digest is sent at 07:00 CET every business day.
      </p>
    </div>
  );
}
