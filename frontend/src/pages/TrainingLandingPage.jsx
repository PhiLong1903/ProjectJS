export const TrainingLandingPage = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="Đào tạo"
          src="/daotao.html"
          className="h-[calc(100vh-180px)] min-h-[2100px] w-full"
          loading="lazy"
        />
      </div>
    </section>
  );
};
