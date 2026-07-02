import React from 'react';
import { ShieldCheck, Lock, Database, Users, Camera, FileText, Mail } from 'lucide-react';

const LAST_UPDATED = 'July 2, 2026';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#e85c24]/10 text-[#e85c24] flex items-center justify-center shrink-0">
                {icon}
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">{title}</h2>
        </div>
        <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-12">
            {children}
        </div>
    </div>
);

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f4f4f5] py-16 px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-2">
                    <img src="/logo.jpeg" alt="Adhimangala Industries" className="w-10 h-10 object-contain rounded-xl" />
                    <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">Adhimangala Industries</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-6 mb-1">Privacy Policy</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Last updated: {LAST_UPDATED}</p>

                <p className="text-slate-600 text-sm leading-relaxed mb-10">
                    This Privacy Policy explains how Adhimangala Industries ("we", "us", "our") collects, uses, and
                    protects information within the Adhimangala Factory Mobile application and the associated
                    administration panel (together, the "App"). The App is an internal Enterprise Resource Planning
                    (ERP) system that manages our manufacturing operations end-to-end — from raw material intake and
                    production, through quality control and packing, to finished-goods dispatch, sales, and accounts.
                </p>

                <Section icon={<Users size={18} />} title="Who this App is for">
                    <p>
                        This App is <strong>not available to the general public</strong>. It is built exclusively for
                        employees and authorized personnel of Adhimangala Industries — including Operators, Production
                        Heads, Quality, Packing, Sales, and Accounts staff — to carry out their assigned job duties.
                        Access requires a company-issued login provided by management; the App is not intended for use
                        by children, and we do not knowingly collect information from anyone outside our organization.
                    </p>
                </Section>

                <Section icon={<Database size={18} />} title="Information we collect">
                    <p>We collect only what is necessary to operate the business functions the App is built for:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Account information</strong> — username, password (stored securely, hashed), assigned role and department.</li>
                        <li><strong>Operational records</strong> — attendance and shift logs, machine and production readings, hourly reports, raw material / semi-finished / finished-goods inventory movements.</li>
                        <li><strong>Business transaction data</strong> — sales orders, invoices, purchase requests, vendor and customer records, ledgers, and payment entries entered by staff in the course of their work.</li>
                        <li><strong>Device-local data</strong> — your session is kept on your device (via local app storage) so you stay signed in; this is not transmitted anywhere other than our own backend.</li>
                    </ul>
                </Section>

                <Section icon={<Camera size={18} />} title="Camera access">
                    <p>
                        The App requests camera access solely to scan QR/barcodes printed on finished-goods packaging
                        during the packing and production-verification workflow. Camera access is used in the moment
                        of scanning only — the App does not capture, store, or transmit photos or video.
                    </p>
                </Section>

                <Section icon={<FileText size={18} />} title="Reports and file access">
                    <p>
                        Certain screens let staff generate and share reports (e.g. PDF or Excel exports of production
                        or accounts data). These files are generated on your device and shared only through the share
                        action you explicitly trigger (e.g. to email, WhatsApp, or another app of your choice) — we do
                        not automatically upload these files anywhere.
                    </p>
                </Section>

                <Section icon={<Lock size={18} />} title="How we use and protect your information">
                    <p>
                        Information collected in the App is used exclusively for internal business operations —
                        production planning, inventory management, quality tracking, sales and accounts record-keeping,
                        and attendance. We do not sell, rent, or share this information with third parties, and we do
                        not use it for advertising. Access is restricted by role-based login, and data is stored on
                        servers controlled by Adhimangala Industries.
                    </p>
                </Section>

                <Section icon={<ShieldCheck size={18} />} title="Data retention">
                    <p>
                        We retain operational and transactional records for as long as needed for business, audit, and
                        legal/compliance purposes. Employee account access is deactivated by management when no longer
                        required (e.g. on staff departure).
                    </p>
                </Section>

                <Section icon={<Mail size={18} />} title="Contact us">
                    <p>
                        If you have questions about this Privacy Policy or how your information is handled, please
                        contact Adhimangala Industries at{' '}
                        <a href="mailto:privacy@adhimangala.com" className="text-[#e85c24] font-bold hover:underline">
                            privacy@adhimangala.com
                        </a>.
                    </p>
                </Section>
            </div>
        </div>
    );
};

export default Privacy;
