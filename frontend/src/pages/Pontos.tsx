import { Header } from "../components/Header"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { IoTimeOutline } from "react-icons/io5";
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pontosRegistradosMock, type PontoRegistrado } from '../data/pontos'

export default function DropdownData() {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                Todos
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Hoje
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Essa semana
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Últimos 15 dias
                        </a>
                    </MenuItem>
                    <form action="#" method="POST">
                        <MenuItem>
                            <button
                                type="submit"
                                className="block w-full px-4 py-2 text-left text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                            >
                                Último mês
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button
                                type="submit"
                                className="block w-full px-4 py-2 text-left text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                            >
                                Último ano
                            </button>
                        </MenuItem>
                    </form>
                </div>
            </MenuItems>
        </Menu>
    )
}

export function DropdownPolo() {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                Todos
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Volta Redonda
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Resende
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Angra dos Reis
                        </a>
                    </MenuItem>
                    <form action="#" method="POST">

                    </form>
                </div>
            </MenuItems>
        </Menu>
    )
}


export const PontosRegistrados = () => {
    const [pontos] = useState<PontoRegistrado[]>(pontosRegistradosMock);
    const [selectedPontoIds, setSelectedPontoIds] = useState<Set<number>>(new Set());


    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set<number>(pontos.map(ponto => Number(ponto.id)));
            setSelectedPontoIds(allIds);
        } else {
            setSelectedPontoIds(new Set());
        }
    };


    const handleSelectPonto = (pontoId: number, checked: boolean) => {
        const newSelected = new Set(selectedPontoIds);
        if (checked) {
            newSelected.add(pontoId);
        } else {
            newSelected.delete(pontoId);
        }
        setSelectedPontoIds(newSelected);
    };



    const isAllSelected = selectedPontoIds.size === pontos.length && pontos.length > 0;

    const isSomeSelected = selectedPontoIds.size > 0 && selectedPontoIds.size < pontos.length;

    return (
        <>
            <Header />
            <section className="p-4 sm:ml-64 mt-20 ">
                <h1 className="text-gray-100 text-4xl font-bold font-manrope leading-normal pb-10">Pontos Registrados</h1>

                {selectedPontoIds.size > 0 && (
                    <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700/50 p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                                <h3 className="text-gray-100 text-lg font-semibold">
                                    Ações Rápidas
                                    <span className="ml-2 text-sm text-blue-400">
                                        ({selectedPontoIds.size} selecionado{selectedPontoIds.size > 1 ? 's' : ''})
                                    </span>
                                </h3>
                            </div>
                            <nav className="flex gap-3">
                                <a href="/pontos/correcao">
                                    <button
                                        className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                    >
                                        <IoTimeOutline className="w-5 h-5" />
                                        <span>Verificar Faltas e Atrasos</span>
                                    </button>
                                </a>
                            </nav>
                        </div>
                    </section>
                )}

                <div className="flex justify-between items-center pb-4">
                    <h2 className="text-gray-100 ">Filtrar por: </h2>
                    <div className="flex gap-4 text-gray-100 items-center">
                        <h2>Data:</h2>
                        < DropdownData />
                        <h2>Polo:</h2>
                        < DropdownPolo />
                    </div>

                </div>

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-2">
                                    <div className="flex items-center">
                                        <input
                                            id="checkbox-all-search"
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(input) => {
                                                if (input) input.indeterminate = isSomeSelected;
                                            }}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Nome do aluno
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Matrícula
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Local de Estágio
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Ponto de Entrada
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Professor Orientador
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Faltas de Estágio
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Polo
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pontos.map((ponto) => (
                                <tr key={ponto.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-4 p-2">
                                        <div className="flex items-center">
                                            <input
                                                id={`checkbox-table-search-${ponto.id}`}
                                                type="checkbox"
                                                checked={selectedPontoIds.has(Number(ponto.id))}
                                                onChange={(e) => handleSelectPonto(Number(ponto.id), e.target.checked)}
                                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label htmlFor={`checkbox-table-search-${ponto.id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <th scope="row" className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {ponto.nomeAluno}
                                    </th>
                                    <td className="px-3 py-2">
                                        {ponto.matricula}
                                    </td>
                                    <td className="px-3 py-2">
                                        {ponto.localEstagio}
                                    </td>
                                    <td className="px-3 py-2">
                                        {ponto.pontoEntrada}
                                    </td>
                                    <td className="px-3 py-2">
                                        {ponto.professorOrientador}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${ponto.faltasEstagio === 0
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : ponto.faltasEstagio <= 2
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {ponto.faltasEstagio}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
                                            {ponto.polo}
                                        </span>
                                    </td>
                                    <td className="flex items-center px-3 py-2">
                                        <Link
                                            to="/alunos/perfil"
                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-xs"
                                        >
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}