import React, { useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';

// Professional, brand-aligned default profile picture
const defaultProfilePic = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAABoABgEDAAMAAAABAAYAAAEaAAUAAAABAAAAaAEbAAUAAAABAAAAcAEoAAMAAAABAAIAAAIBAAQAAAABAAAAeAICAAQAAAABAAACeAAAAAAAAGABAAAAAQAAAGABAAAAAf/sAQwAFAwQEBAMFBAQEBQUFBgcMCAcHBwcPCwsJDBEPEhIRDxERExYcFxMUGhURERghGBodHR8fHxMXIiQiHiQcHh8e/9sAQwEFBQUHBgcOCAgOHhQRFB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4e/8AAEQgCeAGAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDQ2Nzg5OkNERUZHSElKU1VWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjMLwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNVE1ZWXVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA-T/+z";

// Icons for social links - modern, refined, and more substantial style
const icons = {
  email: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>,
  linkedin: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-11 15H5v-9h3v9zm-1.5-10.26a1.74 1.74 0 110-3.48 1.74 1.74 0 010 3.48zM19 18h-3v-4.4c0-1.42-.6-2.38-1.77-2.38-1.25 0-1.73.91-1.73 2.38V18h-3v-9h3v1.34h.04c.42-.77 1.44-1.59 3.2-1.59 3.38 0 3.96 2.22 3.96 5.09V18z"/></svg>,
  youtube: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 7.03c-.24-1.28-.9-2.2-2.18-2.43C17.63 4.2 12 4.2 12 4.2s-5.63 0-7.4.4C3.32 4.83 2.66 5.75 2.42 7.03 2 8.84 2 12 2 12s0 3.16.42 4.97c.24 1.28.9 2.2 2.18 2.43C6.37 19.8 12 19.8 12 19.8s5.63 0 7.4-.4c1.28-.23 1.94-1.15 2.18-2.43.42-1.81.42-4.97.42-4.97s0-3.16-.42-4.97zM9.75 15V9l6 3-6 3z"/></svg>,
  instagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.001c-3.24 0-3.633.014-4.9.07-4.22.193-6.052 2.023-6.244 6.244-.056 1.267-.07 1.66-.07 4.9s.014 3.633.07 4.9c.192 4.22 2.023 6.052 6.244 6.244 1.267.056 1.66.07 4.9.07s3.633-.014 4.9-.07c4.22-.192 6.052-2.023 6.244-6.244.056-1.267.07-1.66.07-4.9s-.014-3.633-.07-4.9c-.192-4.22-2.023-6.052-6.244-6.244-1.267-.056-1.66-.07-4.9-.07zM12 6.837c-2.848 0-5.163 2.315-5.163 5.163s2.315 5.163 5.163 5.163 5.163-2.315 5.163-5.163-2.315-5.163-5.163-5.163zm0 8.837c-1.996 0-3.616-1.62-3.616-3.616s1.62-3.616 3.616-3.616 3.616 1.62 3.616 3.616-1.62 3.616-3.616-3.616zm6.406-9.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/></svg>,
  whatsapp: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM9.51 16.34c-.21.07-.43.1-.65.1-.3 0-.59-.06-.87-.19-1.31-.58-2.22-1.74-2.33-1.92-.12-.18-.89-1.3-.89-2.52s.58-1.85.79-2.09c.21-.24.45-.28.6-.28.14 0 .28 0 .4 0 .15 0 .35.03.53.25.18.22.62 1.5.67 1.63.05.13.09.28.01.44s-.25.35-.38.48c-.13.13-.25.26-.38.42-.12.16-.25.32-.1.58.15.26.68.98 1.43 1.68.96.88 1.76 1.15 2.02 1.28.26.13.41.1.58-.06.17-.16.73-.85.92-1.12.19-.27.38-.21.63-.12.25.09 1.58.74 1.85.88.27.14.45.21.52.32.07.11.07.68-.14 1.32-.21.64-1.25 1.21-1.71 1.21z"/></svg>,
};


const About: React.FC = () => {
    const [profilePic, setProfilePic] = useLocalStorage('about-profile-pic');
    const profilePicInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const contactInfo = [
        { icon: icons.email, label: 'Email', value: 'marciaveterinaria9@hotmail.com', href: 'mailto:marciaveterinaria9@hotmail.com' },
        { icon: icons.linkedin, label: 'LinkedIn', value: 'Márcia Salgado', href: 'https://www.linkedin.com/in/m%C3%A1rcia-salgado-212193344?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' },
        { icon: icons.youtube, label: 'YouTube', value: '@marciasalgado7554', href: 'https://youtube.com/@marciasalgado7554?si=XhwjBGwJ0r1gli4g' },
        { icon: icons.instagram, label: 'Instagram', value: '@vetagrosustentavel', href: 'https://www.instagram.com/vetagrosustentavel?igsh=dTR0ZjJ1eHRpc3lv' },
        { icon: icons.whatsapp, label: 'Canal no WhatsApp', value: 'VetAgro Sustentável', href: 'https://whatsapp.com/channel/0029VbBgvebKrWQnR4U5sP3a' }
    ];

    return (
        <section className="py-12 bg-light">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-dark font-serif">Sobre Mim</h2>
                    <p className="text-slate-600 max-w-3xl mx-auto mt-2">
                        Conheça a profissional por trás da iniciativa VetAgro Sustentável AI.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-1 flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <img
                                    src={profilePic || defaultProfilePic}
                                    alt="M.Sc Márcia Salgado"
                                    className="w-48 h-48 rounded-full object-cover shadow-lg border-4 border-white"
                                />
                                 <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <input type="file" accept="image/*" ref={profilePicInputRef} onChange={handleFileChange} className="hidden" />
                                    <button onClick={() => profilePicInputRef.current?.click()} className="text-xs bg-white/80 text-black px-2 py-1 rounded hover:bg-white">Alterar</button>
                                    {profilePic && <button onClick={() => setProfilePic(null)} className="ml-1 text-xs bg-red-500/80 text-white px-2 py-1 rounded hover:bg-red-500">X</button>}
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-dark font-serif">M.Sc Márcia Salgado</h1>
                            <p className="text-slate-600">Médica Veterinária e Pesquisadora</p>
                            <p className="text-sm text-slate-500 mt-1">Especialista em defesa sanitária animal e HIPOA.</p>
                        </div>
                        <div className="md:col-span-2 text-slate-700 leading-relaxed space-y-4">
                            <p>Olá! Sou Médica Veterinária, pesquisadora e entusiasta da conexão entre saúde animal, eficiência produtiva e sustentabilidade ambiental.</p>
                            <p>Com Mestrado em Produção Animal e atualmente candidata ao Doutorado em Biodiversidade e Conservação Sustentável, direciono minha pesquisa para estratégias de mitigação de gases de efeito estufa (GEE) e manejo inteligente de pastagens tropicais — sempre com foco em soluções que tornem a pecuária amazônica mais sustentável, rentável e resiliente.</p>
                            <p>O projeto VetAgro Sustentável nasceu desse compromisso — de traduzir o conhecimento científico em ações práticas e acessíveis, aproximando a pesquisa da realidade produtiva.</p>
                        </div>
                    </div>

                    <div className="mt-12 border-t pt-8">
                         <h2 className="text-3xl font-bold text-dark text-center mb-8 font-serif">Entre em Contato</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contactInfo.map((item, index) => (
                                <a href={item.href} key={index} target="_blank" rel="noopener noreferrer" 
                                   className="bg-slate-50 p-4 rounded-lg flex items-center gap-4 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform border hover:border-secondary">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-dark truncate">{item.label}</p>
                                        <p className="text-sm text-slate-600 truncate">{item.value}</p>
                                    </div>
                                </a>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;