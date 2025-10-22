import { Header } from "../components/Header";


export function ProfileAluno() {
    return (
        <>
            < Header />
            <section className="w-auto pt-0 sm:ml-64 lg:pl-15 pt-25 p-5 rounded-3xl min-h-screen">
                
                <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-sm p-6">
                    <p className="font-sans antialiased text-base text-gray-100 font-semibold mb-1">Informações do aluno</p>
                    <p className="font-sans antialiased text-sm text-stone-600">Update your profile information below.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 gap-6">

                        
                        <div className="space-y-1">
                            <label htmlFor="first-name" className="block mb-1 text-sm font-semibold antialiased text-stone-200">Nome</label>
                            <input id="first-name" type="text" placeholder="Emma" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-200 dark:text-black placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="last-name" className="block mb-1 text-sm font-semibold antialiased text-stone-200">Sobrenome</label>
                            <input id="last-name" type="text" placeholder="Roberts" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-200 dark:text-black placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="gender" className="block mb-1 text-sm font-semibold antialiased text-stone-200">Matrícula</label>
                            <div className="dropdown" data-dui-placement="bottom-start">
                                <input data-dui-toggle="dropdown" aria-expanded="false" placeholder="Select Gender" type="text" className="w-full mt-1 aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-200 dark:text-black placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                                <div data-dui-role="menu" className="hidden mt-2 bg-white border border-gray-700 rounded-lg shadow-sm p-1 z-10">
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Male</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Female</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Other</a>
                                </div>
                            </div>
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="birth-date" className="block mb-1 text-sm font-semibold antialiased text-stone-200">Birth Date</label>
                            <input id="birth-date" type="date" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-200 dark:text-black placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer appearance-none" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="profession" className="block mb-1 text-sm font-semibold antialiased text-stone-200">Curso</label>
                            <div className="dropdown" data-dui-placement="bottom-start">
                                <input data-dui-toggle="dropdown" aria-expanded="false" placeholder="Select Profession" type="text" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-200 dark:text-black placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                                <div data-dui-role="menu" className="hidden mt-2 bg-white border border-gray-700 rounded-lg shadow-sm p-1 z-10">
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Software Engineer</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Designer</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-100 rounded-md">Product Manager</a>
                                </div>
                            </div>
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="education" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Turma</label>
                            <div className="dropdown" data-dui-placement="bottom-start">
                                <input data-dui-toggle="dropdown" aria-expanded="false" placeholder="Select Level" type="text" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                                <div data-dui-role="menu" className="hidden mt-2 bg-white border border-gray-700 rounded-lg shadow-sm p-1 z-10">
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 rounded-md">High School</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 rounded-md">Bachelor's</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 rounded-md">Master's</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 rounded-md">PhD</a>
                                </div>
                            </div>
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="email" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Email</label>
                            <input id="email" type="email" placeholder="emma@mail.com" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="confirm-email" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Confirm Email</label>
                            <input id="confirm-email" type="email" placeholder="emma@mail.com" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="location" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Polo</label>
                            <input id="location" type="text" placeholder="Florida, USA" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="phone-number" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Número de Telefone</label>
                            <input id="phone-number" type="text" placeholder="+123 0123 456 789" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="language" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Local de Estágio</label>
                            <input id="language" type="text" placeholder="English" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                        
                        <div className="space-y-1">
                            <label htmlFor="skills" className="block mb-1 text-sm font-semibold antialiased text-stone-100">Skills</label>
                            <input id="skills" type="text" placeholder="React, TailwindCSS, HTML, CSS" className="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-white placeholder:text-stone-100/60 ring-transparent border border-gray-700 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-gray-800 rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}