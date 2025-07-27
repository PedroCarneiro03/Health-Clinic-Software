
import { useEffect, useState } from "react"
import "./pacient-box.css"

export function PacientBox({
    user,
  }: {
    user: {
      name: string,
      birthdate: string,
      height: number,
      weight:number,
      gender:string,
      photoUrl: string,
      id:string

    }
  }) {


    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const role= sessionStorage.getItem("role")

    useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    const photoFile = user.photoUrl

    if (photoFile && token) {
      fetch(`http://localhost:8081/${photoFile}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar foto")
          return res.blob()
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          setAvatarUrl(url)
        })
        .catch((err) => console.error(err))
    }
    else {
      // Se não houver filename, usa o ícone por defeito diretamente
      setAvatarUrl("/icons/patientAvatar.png")
    }
  }, [])


    function calcularIdade(birthdate: string): number {
      const [year, month, day] = birthdate.split('-').map(Number)
      const hoje = new Date()

      let idade = hoje.getFullYear() - year

      const mesAtual = hoje.getMonth() + 1
      const diaAtual = hoje.getDate()

      if (mesAtual < month || (mesAtual === month && diaAtual < day)) {
        idade--
      }

      return idade
    }

    return(
        <div className="userBox">
            <img
                src={avatarUrl || "/avatars/shadcn.jpg"}
                alt="Pacient Photo"
                className="userPhoto"
              />
            <div className="userInfo">
                <h1>
                    {user.name}
                </h1>
                <ul>
                    <li>{calcularIdade(user.birthdate)} anos</li>
                    <li>
                      {user.weight ? `${user.weight} kg` : "Ainda não registou o peso"}
                    </li>
                    <li>
                      {user.height ? `${user.height} cm` : "Ainda não registou a altura"}
                    </li>
                    <li>{user.gender}</li>

                </ul>
            </div>
        </div>
    )
}