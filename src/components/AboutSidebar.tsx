"use client";
import { useI18n } from "@/components/I18nProvider";

export default function AboutSidebar({
  onManageClick,
}: {
  onManageClick?: () => void;
}) {
  const { t } = useI18n();

  return (
    <aside className="space-y-3">
      <section className="panel">
        <h3 className="font-semibold mb-1.5">{t("side.title")}</h3>
        <p className="text-sm text-muted">{t("side.desc")}</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li>• {t("side.p1")}</li>
          <li>• {t("side.p2")}</li>
          <li>• {t("side.p3")}</li>
          <li>• {t("side.p4")}</li>
          <li>• {t("side.p5")}</li>
        </ul>
      </section>

      <section className="panel">
        <h3 className="font-semibold mb-1.5">{t("side.privacyTitle")}</h3>
        <p className="text-sm text-muted">{t("side.privacyDesc")}</p>
      </section>

      <section className="panel">
        <h3 className="font-semibold mb-1.5">{t("side.extTitle")}</h3>
        <p className="text-sm text-muted">{t("side.extTip")}</p>
        <button className="btn-ghost btn-sm mt-2" onClick={onManageClick}>
          {t("side.manage")}
        </button>
      </section>
    </aside>
  );
}
