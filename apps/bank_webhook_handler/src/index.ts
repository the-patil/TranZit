import db from "@repo/db/client";
import express from "express";

const app = express();
const port = 3000;


app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validations here?
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string;
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    }
    try {
        await db.$transaction([
            db.balance.update({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),
            db.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch (e) {
        console.log(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }
})

app.listen(port, () => {
    console.log("listening on port" + port)
})