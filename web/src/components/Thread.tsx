type Msg = {
  id: string;
  body: string;
  sentAt: Date;
  fromUserId: string;
  fromUser: { name: string };
};

/** Server-rendered two-way message thread + a plain-form composer. */
export function Thread({
  messages,
  myUserId,
  back,
  patientProfileId,
}: {
  messages: Msg[];
  myUserId: string;
  back: string;
  patientProfileId?: string; // set when the sender is a therapist
}) {
  return (
    <div>
      <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            No messages yet — say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.fromUserId === myUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                mine
                  ? "self-end bg-teal-700 text-white"
                  : "self-start border border-neutral-200 bg-neutral-50"
              }`}
            >
              <div className={`mb-0.5 text-[11px] font-medium ${mine ? "text-teal-100" : "text-neutral-400"}`}>
                {m.fromUser.name} ·{" "}
                {new Date(m.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              {m.body}
            </div>
          );
        })}
      </div>
      <form method="POST" action="/api/messages" className="mt-3 flex gap-2">
        <input type="hidden" name="back" value={back} />
        {patientProfileId && (
          <input type="hidden" name="patientProfileId" value={patientProfileId} />
        )}
        <input
          name="body"
          required
          maxLength={2000}
          placeholder="Write a message…"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          autoComplete="off"
        />
        <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          Send
        </button>
      </form>
      <p className="mt-2 text-xs text-neutral-400">
        Secure in-app messaging — health details never travel over email or SMS.
      </p>
    </div>
  );
}
