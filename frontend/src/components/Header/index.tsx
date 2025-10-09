import { useState } from 'react'
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
	const [menu, setMenu] = useState(false);
	const { user, signOut } = useAuth();

	const toggleMenu = () => {
		setMenu(!menu);
	};

	const handleSignOut = async () => {
		await signOut();
	};


	return (
		<>
			<nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-gray-800 border-gray-700">
				<div className="px-3 py-3 lg:px-5 lg:pl-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center justify-start rtl:justify-end">
							<button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={toggleMenu}>
								<span className="sr-only">Open sidebar</span>
								<svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
								</svg>
							</button>
							<a href="/login" className="flex ms-2 md:me-24 ">
								<svg className="w-10 h-10" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M302.604 176.508C319.896 182.561 336.841 188.432 353.779 194.321C358.626 196.006 362.265 198.43 362.256 204.506C362.247 210.397 359.09 213.148 354.14 214.991C345.272 218.291 336.502 221.858 327.603 225.071C324.814 226.078 323.87 227.463 323.916 230.444C324.099 242.267 323.622 254.109 324.125 265.913C324.445 273.435 321.337 278.644 315.808 282.983C305.751 290.875 294.088 295.229 281.717 297.428C254.218 302.315 226.751 302.573 199.607 295.001C190.552 292.476 182.163 288.498 175.587 281.446C172.041 277.643 170.16 273.298 170.234 267.94C170.407 255.451 170.199 242.957 170.358 230.468C170.394 227.676 169.511 226.335 166.913 225.367C157.889 222.009 148.939 218.452 139.988 214.902C133.79 212.444 131.932 209.781 131.967 204.304C132.003 198.646 135.531 196.092 140.249 194.417C173.734 182.532 207.174 170.521 240.754 158.914C244.206 157.72 248.778 158.001 252.326 159.152C269.065 164.582 285.628 170.554 302.604 176.508ZM205.043 229.491C217.558 234.404 230.028 239.439 242.631 244.114C244.824 244.928 247.854 244.95 250.033 244.12C282.452 231.769 314.795 219.218 347.147 206.691C348.472 206.178 349.712 205.443 351.536 204.543C316.829 192.451 282.825 180.567 248.766 168.841C246.954 168.217 244.521 168.454 242.651 169.093C230.242 173.328 217.902 177.766 205.551 182.171C184.836 189.557 164.13 196.967 142.29 204.771C163.651 213.167 183.996 221.164 205.043 229.491ZM224.443 247.989C210.028 242.351 195.613 236.712 180.703 230.881C180.703 243.539 180.841 255.359 180.628 267.173C180.554 271.294 181.889 274.628 185.263 276.471C191.626 279.946 197.994 283.985 204.885 285.814C227.746 291.879 251.057 291.456 274.303 288.232C286.388 286.555 298.134 283.303 308.122 275.846C310.488 274.08 313.424 271.138 313.537 268.622C314.094 256.206 313.79 243.751 313.79 230.762C311.745 231.452 310.2 231.911 308.701 232.49C294.756 237.873 280.386 242.389 266.998 248.917C252.867 255.806 239.679 256.749 226.082 248.658C225.797 248.489 225.485 248.364 224.443 247.989Z" fill="white"/>
									<path d="M418.131 139.119C422.628 136.89 426.711 134.627 430.983 132.805C434.999 131.092 439.138 132.759 440.677 136.255C442.305 139.955 440.823 143.946 436.804 145.807C418.699 154.192 402.811 165.987 387.026 177.952C384.904 179.561 382.849 181.276 380.628 182.738C376.449 185.488 372.352 185.033 369.97 181.726C367.405 178.165 368.122 173.886 372.329 170.906C386.58 160.811 400.949 150.883 415.278 140.898C416.097 140.327 416.957 139.816 418.131 139.119Z" fill="white"/>
									<path d="M321.731 134.808C320.485 136.792 319.709 138.787 318.283 140.042C315.649 142.36 312.492 142.575 309.609 140.37C306.123 137.703 306.036 134.101 307.825 130.532C311.993 122.214 316.376 114.004 320.658 105.744C325.018 97.335 329.353 88.913 333.713 80.504C336.227 75.656 339.641 74.139 343.718 76.02C347.539 77.782 348.959 82.104 346.638 86.665C338.498 102.658 330.166 118.553 321.731 134.808Z" fill="white"/>
									<path d="M380.73 242.302C377.383 236.206 378.565 231.523 384.398 230.275C400.316 226.868 416.355 224.023 432.369 221.074C434.294 220.719 436.393 220.852 438.342 221.178C442.368 221.852 445.168 224.017 445.1 228.465C445.031 232.942 442.151 234.747 438.079 235.441C421.879 238.201 405.712 241.169 389.481 243.739C386.779 244.166 383.824 242.998 380.73 242.302Z" fill="white"/>
									<path d="M134.905 356.8C135.681 354.723 136.347 353.022 137.009 351.32C140.518 342.298 140.518 342.298 150.692 343.101C150.692 354.493 150.692 365.913 150.692 377.673C148.546 377.673 146.316 377.673 143.517 377.673C143.517 370.613 143.517 363.399 143.517 356.186C143.091 356.086 142.665 355.985 142.239 355.884C139.841 361.905 137.55 367.972 134.972 373.914C134.294 375.475 132.728 376.651 131.569 378.005C130.583 376.656 129.294 375.435 128.663 373.937C126.095 367.842 123.729 361.662 120.474 355.579C120.474 362.854 120.474 370.129 120.474 377.703C117.696 377.703 115.457 377.703 113.009 377.703C113.009 366.266 113.009 354.82 113.009 343.404C113.353 343.207 113.625 342.922 113.91 342.907C123.11 342.428 123.106 342.433 126.518 351.121C128.125 355.212 129.748 359.298 131.759 364.387C133.035 361.353 133.914 359.264 134.905 356.8Z" fill="white"/>
									<path d="M231.132 369.924C231.132 360.798 231.132 352.16 231.132 343.169C239.383 343.169 247.434 343.169 255.81 343.169C255.81 344.915 255.81 346.789 255.81 349.058C250.387 349.058 244.959 349.058 239.191 349.058C239.191 351.667 239.191 353.909 239.191 356.798C244.54 356.798 250.069 356.798 255.74 356.798C255.74 359.214 255.74 360.991 255.74 363.184C250.177 363.184 244.753 363.184 239.088 363.184C239.088 366.027 239.088 368.454 239.088 371.337C244.621 371.337 250.03 371.337 255.779 371.337C255.779 373.673 255.779 375.565 255.779 377.747C247.889 377.747 239.813 377.747 231.132 377.747C231.132 375.277 231.132 372.845 231.132 369.924Z" fill="white"/>
								</svg>
								<span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white px-4">Meu Estágio</span>
							</a>
						</div>
						<div className="flex items-center">
							<div className="flex items-center ms-3">
								<div>
									<button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
										<span className="sr-only">Open user menu</span>
									</button>
								</div>
								<div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
									<div className="px-4 py-3" role="none">
										<p className="text-sm text-gray-900 dark:text-white" role="none">
											{user?.displayName || 'Usuário'}
										</p>
										<p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
											{user?.email || 'email@sistema.com'}
										</p>
									</div>
									<ul className="py-1" role="none">
										<li>
											<a href="/home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Dashboard</a>
										</li>
										<li>
											<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Configurações</a>
										</li>
										<li>
											<button 
												onClick={handleSignOut}
												className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" 
												role="menuitem"
											>
												Sair
											</button>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>

			</nav>
			<Sidebar isMenuOpen={menu} />
		</>
	)
}