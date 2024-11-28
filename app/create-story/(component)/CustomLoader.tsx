import {  Modal,   ModalContent,   ModalHeader,   ModalBody,   ModalFooter, useDisclosure} from "@nextui-org/modal";
import Image from "next/image";
import React, { useEffect } from 'react'

function CustomLoader({isLoading}:any){
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    useEffect(() => {
        onOpen()
    }, [])
  return (
    <div>
    {
      isLoading && <Modal 
      backdrop="opaque" 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      radius="lg"
      classNames={{
        body: "py-6",
        backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="w-full p-12 flex items-center justify-center bg-[#ffffff]">
              <Image src={'/Loader.gif'} height={200} width={200} alt="loading..."/>
              <h2 className="font-bold text-2xl text-primary text-center">Story is generating...</h2>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
    }
  </div>
  )
}

export default CustomLoader