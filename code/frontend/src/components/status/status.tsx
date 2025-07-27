import { CircleX } from 'lucide-react';
import { MouseEventHandler } from 'react';


export function Status({ type, onCancel }: { type: string, onCancel?: MouseEventHandler }) {
    const lowerType = type.toLowerCase()
  
    function getStyles() {
      let bgColor = ""
      let borderColor = ""
      let textColor = ""
  
      if (lowerType === "ativo" || lowerType=="concluído") {
        bgColor = "rgba(22, 192, 152, 0.38)"
        borderColor = "#00B087"
        textColor = "#008767"
      } else if (lowerType === "expirou") {
        bgColor = "#FFC5C5"
        borderColor = "#DF0404"
        textColor = "#DF0404"
      } else if (lowerType === "espera") {
        bgColor = "rgba(255, 145, 0, 0.38)"
        borderColor = "#DB6E00"
        textColor = "#DB6E00"
      }
  
      return {
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }
    }

  
    const styles = getStyles()
  
    return (
    <div className='flex items-center gap-1'>
      <div
        className="flex items-center justify-center rounded w-[124px] h-[30px] py-1 px-3 border font-medium leading-[21px] tracking-[-0.01em]"
        style={styles}>
        {type}
      </div>
      {lowerType === "ativo" && (<button onClick={onCancel} ><CircleX strokeWidth={2} className="h-[22px] w-[22px] rounded p-0.5" /></button>)}
    </div>
    )
  }
  