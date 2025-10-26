import React from "react";

const Footer = () => {
    return (
        <footer className="bg-black border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center py-6">
                {/* Logo/Imagen */}
                <div className="mb-4 md:mb-0">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <span className="text-xs text-gray-500">LOGO</span>
                    </div>
                </div>

                {/* Enlaces básicos */}
                <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                    <div>
                        <h3 className="text-gray-400 font-medium mb-2">Recursos</h3>
                        <ul className="space-y-1">
                            <li>
                                <a href="#" className="text-gray-500 hover:text-white transition">
                                    Documentación
                                </a>
                            </li>
                            <li>
                            <a
                                href="#"
                                className="text-gray-500 hover:text-white transition"
                            >
                                Soporte
                            </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                    <h3 className="text-gray-400 font-medium mb-2">Legal</h3>
                    <ul className="space-y-1">
                        <li>
                        <a
                            href="#"
                            className="text-gray-500 hover:text-white transition"
                        >
                            Privacidad
                        </a>
                        </li>
                        <li>
                        <a
                            href="#"
                            className="text-gray-500 hover:text-white transition"
                        >
                            Términos
                        </a>
                        </li>
                    </ul>
                    </div>
                </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800"></div>

                {/* Copyright */}
                <div className="py-4 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Shaddai App. Todos los
                    derechos reservados.
                </p>
                <div className="mt-2 md:mt-0">
                    <span className="text-gray-500 text-sm">v1.0.0</span>
                </div>
                </div>
            </div>
        </footer>
  );
}

export default Footer;