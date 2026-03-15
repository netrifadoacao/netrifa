import { createAdminClient } from '@/utils/supabase/admin';

type ActivationInput = {
  userId: string;
  amount: number;
  externalReference?: string | null;
};

export async function activateUserAfterAdesaoPayment({
  userId,
  amount,
  externalReference = null,
}: ActivationInput) {
  const admin = createAdminClient();

  const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (confirmError) {
    throw new Error(confirmError.message);
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('sponsor_id')
    .eq('id', userId)
    .single();

  const referrerId = profile?.sponsor_id ?? null;
  let sponsorIdToSet: string | null = null;

  if (referrerId) {
    const { data: siblings } = await admin
      .from('profiles')
      .select('id')
      .eq('sponsor_id', referrerId)
      .order('created_at', { ascending: true });

    const list = siblings ?? [];
    const pos = list.findIndex((p: { id: string }) => p.id === userId);
    if (pos === 1 || pos === 2) {
      const firstId = list[0]?.id;
      if (firstId) sponsorIdToSet = firstId;
    }
  }

  if (sponsorIdToSet !== null) {
    await admin.from('profiles').update({ role: 'member', sponsor_id: sponsorIdToSet }).eq('id', userId);
  } else {
    await admin.from('profiles').update({ role: 'member' }).eq('id', userId);
  }

  const { data: existingOrder } = await admin
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('amount', amount)
    .eq('status', 'paid')
    .limit(1)
    .maybeSingle();

  if (existingOrder?.id) {
    return { activated: true, orderId: existingOrder.id, alreadyPaid: true };
  }

  const { data: newOrder, error: insertError } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      product_id: null,
      amount,
      status: 'paid',
      mp_preference_id: externalReference,
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { activated: true, orderId: newOrder.id, alreadyPaid: false };
}
