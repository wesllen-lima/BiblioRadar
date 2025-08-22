"use client";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "@/lib/cookieStore";
import { useI18n } from "@/components/I18nProvider";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const ok = getCookie("br_cookie_consent");
    if (!ok) setShow(true);
  }, []);

  function accept() {
    setCookie("br_cookie_consent", "v1");
    setCookie("br_store", "cookie");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[94%]">
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="brand-dot shrink-0" aria-hidden />
          <div className="text-sm leading-relaxed">
            <strong>{t("cookies.title")}</strong> {t("cookies.desc")}
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost btn-sm" onClick={() => setShow(false)}>{t("cookies.later")}</button>
          <button className="btn-primary btn-sm" onClick={accept}>{t("cookies.ok")}</button>
        </div>
      </div>
    </div>
  );
}
